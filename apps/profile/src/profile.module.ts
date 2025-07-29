import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schema/profile.schema';
import { ProfileController } from './controllers/profile.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '@app/common/configs/appConfig';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          algorithm: configService.get('jwt.algorithm'),
        },
      }),
      global: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongo.uri'),
        dbName: configService.get('mongo.dbName'),
      }),
    }),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
