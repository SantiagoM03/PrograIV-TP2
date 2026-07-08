/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // Con esto puedo usar métodos/propiedades de Mongoose, como _id, save(), createdAt y updatedAt.

// Acá defino los perfiles que permito en la aplicación.
export enum UserProfile
{
  Usuario = 'usuario',
  Administrador = 'administrador',
}

// Acá marco que esta clase se transforma en una colección de Mongoose.
@Schema({
  collection: 'users',
  timestamps: true, // Acá hago que Mongoose agregue createdAt y updatedAt automáticamente.
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
    select: false, // Acá evito que Mongoose devuelva este campo por defecto cuando busco usuarios.
  })
  passwordHash!: string; // Acá no guardo la contraseña original, solo el hash generado con bcrypt.

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

// Acá creo el esquema de Mongoose a partir de la clase User.
export const UserSchema = SchemaFactory.createForClass(User);