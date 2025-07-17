import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './configs/appConfig';
import { Algorithm } from 'jsonwebtoken';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiResponseInterceptor } from './common/interceptors/response.interceptor';
import { ChatModule } from './modules/chats/chats.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: appConfig.jwt.secret,
        signOptions: {
          algorithm: appConfig.jwt.algorithm as Algorithm,
        },
      }),
      global: true,
    }),
    MongooseModule.forRoot(appConfig.mongo.uri, {
      dbName: appConfig.mongo.dbName,
    }),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  ],
})
export class AppModule {}
