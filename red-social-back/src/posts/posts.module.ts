/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import { StatisticsController } from './statistics.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

/*
  Acá registro el modelo de publicaciones y dejo expuesto PostsService
  para comentarios, perfiles y estadísticas.
*/
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [PostsController, CommentsController, StatisticsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}