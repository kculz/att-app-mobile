import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import useGetToken from './useGetToken';

const useWebSocket = () => {
  const { userId, token } = useGetToken();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const WS_URL = `ws://172.20.10.5:3001/ws?token=${token}`;

  const connectWebSocket = useCallback(() => {
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
          const data = JSON.parse(messageString);
          
          console.log('Received WebSocket message:', data);
          setMessages(prev => [...prev, data]);
          
          // Handle specific message types
          switch(data.type) {
            case 'chat_message':
              // Handle incoming chat message
              break;
            case 'incoming_call':
              // Handle incoming call
              break;
            case 'call_signal':
              // Handle WebRTC signaling
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              Alert.alert('WebSocket Error', data.message);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        setIsConnected(false);
        
        // Exponential backoff reconnection
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
      Alert.alert('Connection Error', 'Failed to setup WebSocket connection');
    }
  }, [token, userId]);

  const sendMessage = useCallback((message) => {
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
        Alert.alert('Error', 'Failed to send message');
      }
    } else {
      console.error('Cannot send message - WebSocket not connected');
      Alert.alert('Connection Error', 'Cannot send message. Please check your connection.');
    }
  }, []);

  const sendChatMessage = useCallback((recipientId, content, chatId) => {
    sendMessage({
      type: 'chat_message',
      recipientId,
      content,
      chatId
    });
  }, [sendMessage]);

  const initiateCall = useCallback((studentId) => {
    sendMessage({
      type: 'call_initiate',
      studentId
    });
  }, [sendMessage]);

  const joinCall = useCallback((callId) => {
    sendMessage({
      type: 'call_join',
      callId
    });
  }, [sendMessage]);

  const endCall = useCallback((callId) => {
    sendMessage({
      type: 'call_end',
      callId
    });
  }, [sendMessage]);

  const rejectCall = useCallback((callId) => {
    sendMessage({
      type: 'call_reject',
      callId
    });
  }, [sendMessage]);

  useEffect(() => {
    if (token && userId) {
      connectWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token, userId, connectWebSocket]);

  return {
    isConnected,
    messages,
    sendMessage,
    sendChatMessage,
    initiateCall,
    joinCall,
    endCall,
    rejectCall,
    reconnect: connectWebSocket
  };
};

export default useWebSocket;