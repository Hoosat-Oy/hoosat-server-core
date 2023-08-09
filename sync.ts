import { IncomingMessage } from "http";
import WebSocket from 'ws';

export const createSyncSocket = (options?: WebSocket.ServerOptions<typeof WebSocket, typeof IncomingMessage>) => {
  
  const clientsMap: Map<string, WebSocket[]> = new Map();
  const wss = new WebSocket.Server(options);

  wss.on('connection', (ws: WebSocket) => {
    ws.once('message', (identifier: string) => {
      const clients = clientsMap.get(identifier) || [];
      clients.push(ws);
      clientsMap.set(identifier, clients);
      ws.send(`Registered to sync with id: ${identifier}`);
      if (clients.length === 1) {
        startSync(clientsMap, identifier);
      }
    });
  });

  const startSync = (clientsMap: Map<string, WebSocket[]>, identifier: string) => {
    const clients = clientsMap.get(identifier) || [];
    clients.forEach(client => {
      client.on('message', (message: string) => {
        clients.forEach(otherClient => {
          if (otherClient !== client && otherClient.readyState === WebSocket.OPEN) {
            otherClient.send(message);
          }
        });
      });
    });
  }
}