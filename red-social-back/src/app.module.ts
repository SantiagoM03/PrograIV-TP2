import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    /*
      ConfigModule permite que NestJS lea variables del archivo .env.
      isGlobal: true significa que ConfigModule queda disponible
      en toda la aplicación sin tener que importarlo en cada módulo.
    */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /*
      MongooseModule conecta NestJS con MongoDB.
      Uso forRootAsync porque la URI de MongoDB viene desde el .env.
    */
    MongooseModule.forRootAsync({
      inject: [ConfigService],

      /*
        ConfigService lee la variable MONGODB_URI del archivo .env.

        getOrThrow significa:
        - Si MONGODB_URI existe, la usa.
        - Si no existe, NestJS corta la ejecución y muestra error.
      */
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    AuthModule,

    UsersModule,

    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
