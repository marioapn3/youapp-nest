import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsAuthService } from '../services/ws-auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private wsAuthService: WsAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();

      const token: string | undefined =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        return false;
      }

      const tokenDoc = await this.wsAuthService.validateWsToken(token);

      if (!tokenDoc) {
        return false;
      }

      client['userId'] = tokenDoc.userId;
      client['username'] = tokenDoc.username;
      client['email'] = tokenDoc.email;

      return true;
    } catch (error) {
      console.error('WS JWT Guard error:', error);
      return false;
    }
  }
}
