import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    AnalyticsModule,
    ProfilesModule,
    /*
      Uso ConfigModule para que NestJS lea variables del archivo .env.
      Con isGlobal: true lo dejo disponible en toda la app
      sin tener que importarlo en cada módulo.
    */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /*
      Acá conecto NestJS con MongoDB.
      Elijo forRootAsync porque la URI viene desde el .env.
    */
    MongooseModule.forRootAsync({
      inject: [ConfigService],

      /*
        ConfigService me lee la variable MONGODB_URI del .env.

        Con getOrThrow:
        - si MONGODB_URI existe, la uso;
        - si no existe, corto el arranque y muestro error.
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
