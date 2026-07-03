/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; //Esto permite usar metodos/propiedades propios de Mongoose, como _id, save(), createdAt, updatedAt, etc.

//Enum para setear los perfiles permitidos en la aplicacipon.
export enum UserProfile
{
  Usuario = 'usuario',
  Administrador = 'administrador',
}

//Se indica que esta clase se va a transformar en una coleccion de Mongoose.
@Schema({
  collection: 'users',
  timestamps: true, //para agregar automáticamente createdAt y updatedAt
})
export class User
{

  @Prop({required: true, trim: true})
  nombre!: string;

  @Prop({required: true, trim: true})
  apellido!: string;

  @Prop({required: true, unique: true, lowercase: true, trim: true})
  correo!: string;

  @Prop({required: true, unique: true, lowercase: true, trim: true})
  nombreUsuario!: string;

  @Prop({
    required: true,
    select: false, // Hace que, por defecto, Mongoose NO devuelva este campo cuando buscamos usuarios.
  })
  passwordHash!: string; //No se guarda la contraseña original, solo el hash generado con bcrypt.

  @Prop({required: true})
  fechaNacimiento!: Date;


  @Prop({required: true, trim: true, maxlength: 180})
  descripcionBreve!: string;

  @Prop({required: true})
  imagenPerfilUrl!: string;

  @Prop({required: true, enum: UserProfile, default: UserProfile.Usuario})
  perfil!: UserProfile;

  @Prop({required: true, default: true})
  habilitado!: boolean;
}

//Se crea el esquema de Mongoose a partir de la clase User.
export const UserSchema = SchemaFactory.createForClass(User);