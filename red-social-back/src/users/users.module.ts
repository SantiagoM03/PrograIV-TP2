/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    //Esto le permite a NestJS/Mongoose saber que existe una colección
    //llamada "users" y que debe usar la estructura definida en UserSchema.
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],

  //Exportamos UsersService y MongooseModule porque AuthModule va a necesitar usar UsersService.
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}