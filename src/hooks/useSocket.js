import { useState, useEffect } from 'react';
import socketService from '../lib/socket.js';

// Hook React pour utiliser le service Socket
export const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: socketService.isSocketConnected(),
    connecting: false
  });

  useEffect(() => {
    const handleConnectionStatus = (status) => {
      setConnectionStatus(prev => ({ ...prev, ...status }));
    };

    const handleConnectionFailed = () => {
      setConnectionStatus({ connected: false, connecting: false, failed: true });
    };

    const cleanup1 = socketService.on('connection_status', handleConnectionStatus);
    const cleanup2 = socketService.on('connection_failed', handleConnectionFailed);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const connect = async () => {
    setConnectionStatus(prev => ({ ...prev, connecting: true }));
    const success = await socketService.connect();
    if (!success) {
      setConnectionStatus({ connected: false, connecting: false, failed: true });
    }
    return success;
  };

  const disconnect = () => {
    socketService.disconnect();
    setConnectionStatus({ connected: false, connecting: false });
  };

  return {
    ...connectionStatus,
    connect,
    disconnect,
    reconnect: socketService.reconnect.bind(socketService),
    socket: socketService,
    isConnected: socketService.isSocketConnected()
  };
};
