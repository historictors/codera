import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io('http://localhost:5000', {
          auth: { token }
        });

        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Disconnected from server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  const value = {
    socket,
    isConnected
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};