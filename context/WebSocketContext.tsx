import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import useGetToken from '@/hooks/useGetToken';
import { useRouter } from 'expo-router';

// Define message types
type MessageType =
  | 'presence_update'
  | 'chat_message'
  | 'call_initiate'
  | 'call_accepted'
  | 'call_join'
  | 'call_end'
  | 'call_reject'
  | 'incoming_call'
  | 'user_joined'
  | 'error';

interface WebSocketMessage {
  type: MessageType;
  [key: string]: any;
}

interface CallData {
  caller?: {
    name: string;
    id: string;
  };
  student?: {
    name: string;
    id: string;
  };
  user?: {
    name: string;
    id: string;
  };
}

interface WebSocketContextType {
  isConnected: boolean;
  messages: WebSocketMessage[];
  sendMessage: (message: WebSocketMessage | string) => void;
  sendChatMessage: (recipientId: string, content: string, chatId?: string) => void;
  initiateCall: (studentId: string, studentInfo: any, supervisionId: string) => string;
  joinCall: (callId: string) => void;
  endCall: (callId: string) => void;
  rejectCall: (callId: string) => void;
  reconnect: () => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => void;
}

const defaultContextValue: WebSocketContextType = {
  isConnected: false,
  messages: [],
  sendMessage: () => {},
  sendChatMessage: () => {},
  initiateCall: () => '',
  joinCall: () => {},
  endCall: () => {},
  rejectCall: () => {},
  reconnect: () => {},
  onMessage: () => {},
};

const WebSocketContext = createContext<WebSocketContextType>(defaultContextValue);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { userId, token } = useGetToken();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const router = useRouter();
  const callIdMap = useRef<Map<string, string>>(new Map());
  const isInCallScreen = useRef(false);
  const messageHandlers = useRef<((message: WebSocketMessage) => void)[]>([]);

  const WS_URL = `ws://172.20.10.7:3001/ws?token=${token}`;

  const connectWebSocket = useCallback(() => {
    if (!token || !userId) {
      console.log('Cannot connect: Missing token or userId');
      return;
    }

    if (socketRef.current && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socketRef.current.readyState)) {
      return;
    }

    console.log('Attempting WebSocket connection...');

    try {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        ws.send(JSON.stringify({
          type: 'presence_update',
          status: 'online',
          userId,
          timestamp: new Date().toISOString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const messageString = event.data.toString();
          const data: WebSocketMessage = JSON.parse(messageString);

          console.log('Received WebSocket message:', data);
          setMessages(prev => [...prev, data]);

          // Call onMessage handlers
          messageHandlers.current.forEach(handler => handler(data));

          switch (data.type) {
            case 'incoming_call':
              handleIncomingCall(data);
              break;

            case 'call_accepted':
              if (!isInCallScreen.current) {
                isInCallScreen.current = true;
                router.push({
                  pathname: '/call',
                  params: {
                    callId: data.callId,
                    otherUser: JSON.stringify((data.callData as CallData).user),
                    isIncoming: 'false',
                    supervisionId: data.supervisionId
                  }
                });
              }
              break;

            case 'call_ended':
              if (isInCallScreen.current) {
                isInCallScreen.current = false;
                router.back();
              }
              break;

            case 'user_joined':
              break;

            case 'error':
              console.error('WebSocket error:', data.message);
              break;
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        setIsConnected(false);

        const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;

        setTimeout(() => {
          console.log(`Attempting reconnect (attempt ${reconnectAttempts.current})`);
          connectWebSocket();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  }, [token, userId, router]);

  const handleIncomingCall = (data: WebSocketMessage) => {
    console.log('Handling incoming call:', data);
    const callData = data.callData as CallData;

    if (!isInCallScreen.current) {
      isInCallScreen.current = true;

      router.push({
        pathname: '/call',
        params: {
          callId: data.callId,
          otherUser: JSON.stringify(callData.caller),
          isIncoming: 'true',
          supervisionId: data.supervisionId
        }
      });

      acceptCall(data.callId as string);
    }
  };

  const sendMessage = useCallback((message: WebSocketMessage | string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageToSend = typeof message === 'object'
          ? JSON.stringify({
              ...message,
              timestamp: new Date().toISOString()
            })
          : message;

        console.log('Sending WebSocket message:', messageToSend);
        socketRef.current.send(messageToSend);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Cannot send message - WebSocket not connected');
    }
  }, []);

  const sendChatMessage = useCallback((recipientId: string, content: string, chatId?: string) => {
    sendMessage({
      type: 'chat_message',
      recipientId,
      content,
      chatId
    });
  }, [sendMessage]);

  const initiateCall = useCallback((studentId: string, studentInfo: any, supervisionId: string) => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    callIdMap.current.set(studentId, callId);

    sendMessage({
      type: 'call_initiate',
      studentId,
      callId,
      supervisionId,
      callData: {
        student: studentInfo
      }
    });

    return callId;
  }, [sendMessage]);

  const acceptCall = useCallback((callId: string) => {
    sendMessage({
      type: 'call_accepted',
      callId
    });
  }, [sendMessage]);

  const joinCall = useCallback((callId: string) => {
    sendMessage({
      type: 'call_join',
      callId
    });
  }, [sendMessage]);

  const endCall = useCallback((callId: string) => {
    sendMessage({
      type: 'call_end',
      callId
    });
  }, [sendMessage]);

  const rejectCall = useCallback((callId: string) => {
    sendMessage({
      type: 'call_reject',
      callId
    });
  }, [sendMessage]);

  const onMessage = (callback: (message: WebSocketMessage) => void) => {
    if (callback) {
      messageHandlers.current.push(callback);
    } else {
      messageHandlers.current = [];
    }
  };

  useEffect(() => {
    if (token && userId) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      isInCallScreen.current = false;
    };
  }, [connectWebSocket, token, userId]);

  const value: WebSocketContextType = {
    isConnected,
    messages,
    sendMessage,
    sendChatMessage,
    initiateCall,
    joinCall,
    endCall,
    rejectCall,
    reconnect: connectWebSocket,
    onMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
