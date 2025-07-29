// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Logger,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Socket } from 'socket.io';
// import { WsException } from '@nestjs/websockets';
// import { Token } from '../../../auth-service/src/modules/auth/schemas/token.schema';

// @Injectable()
// export class WsJwtGuard implements CanActivate {
//   private readonly logger = new Logger(WsJwtGuard.name);

//   constructor(@InjectModel(Token.name) private tokenModel: Model<Token>) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       const client = context.switchToWs().getClient<Socket>();
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       const token =
//         client.handshake.auth?.token || client.handshake.headers.authorization;

//       if (!token) {
//         this.logger.warn('Unauthorized: missing WebSocket token');
//         throw new WsException('Unauthorized missing WStoken');
//       }

//       this.logger.debug(`Validating token: ${token}`);

//       const tokenDoc = await this.tokenModel
//         .findOne({
//           token: token,
//           active: true,
//           type: 'ws',
//           expiryDate: { $gt: new Date() },
//         })
//         .exec();

//       this.logger.debug(
//         `Token validation result: ${tokenDoc ? 'valid' : 'invalid'}`,
//       );

//       if (!tokenDoc) {
//         this.logger.warn('Invalid WebSocket token');
//         throw new WsException('Invalid token');
//       }

//       client['userId'] = tokenDoc.userId;
//       this.logger.log(
//         `User ${tokenDoc.userId.toString()} authenticated successfully`,
//       );

//       return true;
//     } catch (error) {
//       this.logger.error('WebSocket authentication error:', error);
//       throw new WsException('Unauthorized');
//     }
//   }
// }
