import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://pf-henry-front-ettfy7o6d-ezequiels-projects-a036481b.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AvisosGateway {
  @WebSocketServer() server: Server;
  private userSockets: Map<string, Socket> = new Map();

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, payload: string): void {
    this.userSockets.set(payload, client);
  }

  handleDisconnect(client: Socket) {
    this.userSockets.forEach((socket, user) => {
      if (socket === client) {
        this.userSockets.delete(user);
      }
    });
  }

  sendAvisosToAll(avisos: any): void {
    this.userSockets.forEach((socket) => {
      socket.emit('newavisos', avisos);
    });
  }
}