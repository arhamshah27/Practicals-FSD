import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeRooms, setActiveRooms] = useState(new Set());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Join previously active rooms
        activeRooms.forEach(roomId => {
          newSocket.emit('join_room', roomId);
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, delay);
        } else {
          toast.error('Failed to connect to chat server');
        }
      });

      // Chat events
      newSocket.on('receive_message', (data) => {
        // Handle incoming message
        console.log('Received message:', data);
        // You can emit a custom event here to notify components
        window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
      });

      newSocket.on('user_typing', (data) => {
        // Handle typing indicator
        window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
      });

      newSocket.on('user_joined', (data) => {
        console.log('User joined room:', data);
        toast.success(`${data.username} joined the chat`);
      });

      newSocket.on('user_left', (data) => {
        console.log('User left room:', data);
        toast.success(`${data.username} left the chat`);
      });

      setSocket(newSocket);

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        newSocket.close();
      };
    } else {
      // Clean up socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  // Join a chat room
  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
      setActiveRooms(prev => new Set([...prev, roomId]));
    }
  };

  // Leave a chat room
  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
      setActiveRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
    }
  };

  // Send a message
  const sendMessage = (roomId, messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        roomId,
        ...messageData
      });
      return true;
    }
    return false;
  };

  // Send typing indicator
  const sendTyping = (roomId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        roomId,
        isTyping
      });
    }
  };

  // Get socket connection status
  const getConnectionStatus = () => {
    return {
      isConnected,
      socketId: socket?.id,
      activeRooms: Array.from(activeRooms)
    };
  };

  // Manual reconnect
  const reconnect = () => {
    if (socket) {
      reconnectAttempts.current = 0;
      socket.connect();
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    getConnectionStatus,
    reconnect,
    activeRooms: Array.from(activeRooms)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
