import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from 'ws';

export const createSyncSocket = (options?: WebSocket.ServerOptions<typeof WebSocket, typeof IncomingMessage>) => {
  
  const clientsMap: Map<string, WebSocket[]> = new Map();
  const wss = new WebSocketServer(options);

  wss.on('connection', (ws: WebSocket) => {
    console.log("WS connection initiated.")
    ws.on('message', (message: string) => {
      const msg = message.toString();
      if(msg.toString().startsWith("register")) {
        const identifier = msg.split("register: ")[1];
        const clients = clientsMap.get(identifier) || [];
        clients.push(ws);
        clientsMap.set(identifier, clients);
        console.log(`Registered to sync with id: ${identifier}`);
        ws.send(`Registered to sync with id: ${identifier}`);
      } else {
        console.log(`message ${message}`);
        clientsMap.forEach((clients) => {
          if (clients.includes(ws)) {
            clients.forEach((otherClient) => {
              if (otherClient !== ws && otherClient.readyState === WebSocket.OPEN) {
                otherClient.send(msg);
              }
            });
          }
        });
        ws.send(msg);
      }
    });
    ws.on('close', () => {
      clientsMap.forEach((clients, identifier) => {
        const index = clients.indexOf(ws);
        if (index !== -1) {
          clients.splice(index, 1);
          clientsMap.set(identifier, clients);
        }
      });
    });
  });
  return wss;
}