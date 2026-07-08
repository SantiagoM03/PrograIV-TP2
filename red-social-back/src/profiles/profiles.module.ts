/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { ProfilesController } from './profiles.controller';

/*
  Acá junto dependencias de usuarios, publicaciones y auth
  para poder resolver el perfil público.
*/
@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [ProfilesController],
})
export class ProfilesModule {}