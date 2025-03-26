import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';

const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const socketRef = useRef(null);

  // IMPORTANT: Replace with your actual WebSocket server URL
  const WS_URL = 'ws://167.172.134.219:3000/ws';

  const connectWebSocket = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    console.log('Attempting WebSocket connection:', WS_URL);

    try {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected Successfully');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Optional: Send a connection confirmation message
        ws.send(JSON.stringify({ type: 'connect', message: 'Hello Server!' }));
      };

      ws.onmessage = (event) => {
        try {
          console.log('Received WebSocket message:', event.data);
          
          // Try to parse the message, but handle both JSON and string messages
          let data;
          try {
            data = JSON.parse(event.data);
          } catch {
            data = { type: 'raw', message: event.data };
          }

          // Add message to state
          setMessages(prevMessages => [...prevMessages, data]);
        } catch (parseError) {
          console.error('Error processing WebSocket message:', parseError);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        setIsConnected(false);
        
        // Exponential backoff for reconnection
        const timeout = Math.min(30000, Math.pow(2, connectionAttempts) * 1000);
        
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          connectWebSocket();
        }, timeout);

        // Show alert if disconnection wasn't clean
        if (!event.wasClean) {
          console.log(
            'Connection Lost',
            'WebSocket connection was interrupted. Attempting to reconnect...'
          );
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error Details:', {
          message: error.message,
          error: JSON.stringify(error)
        });

        console.log(
          'WebSocket Connection Error',
          `Unable to establish WebSocket connection. Please check your network and try again. 
          Error: ${error.message}`
        );

        setIsConnected(false);
      };

      setSocket(ws);
    } catch (setupError) {
      console.log(
        'Connection Error',
        'Failed to set up WebSocket connection'
      );
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectionAttempts]);

  // Connect on component mount
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Method to send messages
  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Ensure message is stringified if it's an object
      const messageToSend = typeof message === 'object' 
        ? JSON.stringify(message) 
        : message;
      
      socket.send(messageToSend);
      console.log('Sent WebSocket message:', messageToSend);
    } else {
      console.error('WebSocket is not open. Unable to send message.');
      console.log(
        'Connection Error',
        'Cannot send message. WebSocket is not connected.'
      );
    }
  }, [socket]);

  return {
    isConnected,
    messages,
    sendMessage,
    reconnect: connectWebSocket
  };
};

export default useWebSocket;