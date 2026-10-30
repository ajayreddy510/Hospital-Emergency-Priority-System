import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-hospital';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        
        // Subscribe to real-time priority queue updates broadcast
        client.subscribe('/topic/queue-updates', (message) => {
          try {
            const body = JSON.parse(message.body);
            toast.info(`Real-Time Queue Event: ${body.event}`, {
              description: 'Emergency priority queue updated automatically',
            });
            // Invalidate React Query cache to re-sync UI tables & dashboard stats instantly
            queryClient.invalidateQueries({ queryKey: ['queue'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['emergency-cases'] });
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [queryClient]);

  return { isConnected };
};
