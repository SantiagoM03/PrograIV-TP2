/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {User, UserDocument, UserProfile} from './schemas/user.schema';

export interface CreateUserData 
{
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  passwordHash: string;
  fechaNacimiento: Date;
  descripcionBreve: string;
  imagenPerfilUrl: string;
  perfil?: UserProfile;
}

export interface UserResponse 
{
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: Date;
  descripcionBreve: string;
  imagenPerfilUrl: string;
  perfil: UserProfile;
  habilitado: boolean;
}

@Injectable()
export class UsersService {

  //Para poder hacer findOne, Create, Save, etc. Usar los metodos y propiedades de Mongoose
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /*
    Busca un usuario por correo.

    Lo usamos para validar que no exista otro usuario con el mismo correo
    antes de registrar uno nuevo.

    Normalizamos a minúsculas porque en el schema también guardamos:
    lowercase: true
  */
  async findByCorreo(correo: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        correo: correo.trim().toLowerCase(),
      })
      .exec();
  }

  /*
    Busca un usuario por nombre de usuario.

    Lo usamos para validar que no exista otro usuario con el mismo nombreUsuario
    antes de registrar uno nuevo.
  */
  async findByNombreUsuario(
    nombreUsuario: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        nombreUsuario: nombreUsuario.trim().toLowerCase(),
      })
      .exec();
  }

  /*
    Busca un usuario por correo o nombre de usuario.

    Este método lo vamos a usar en login.

    Como passwordHash tiene select: false en el schema, normalmente no viene
    en las consultas. Pero para login necesitamos comparar la contraseña
    ingresada con el hash guardado.

    Por eso usamos:
    .select('+passwordHash')

    Eso le dice a Mongoose:
    "en esta consulta puntual, sí necesito traer passwordHash".
  */
  async findByUsuarioOCorreoWithPassword(
    usuarioOCorreo: string,
  ): Promise<UserDocument | null> {
    const value = usuarioOCorreo.trim().toLowerCase();

    return this.userModel
      .findOne({
        $or: [
          { correo: value },
          { nombreUsuario: value },
        ],
      })
      .select('+passwordHash')
      .exec();
  }

  /*
    Crea un usuario en MongoDB.

    Este método recibe datos ya preparados:
    - passwordHash ya viene hasheada.
    - fechaNacimiento ya viene convertida a Date.
    - imagenPerfilUrl ya viene generada.

    La responsabilidad de este service es guardar el usuario.
  */
  async createUser(data: CreateUserData): Promise<UserDocument> {
    const user = new this.userModel({
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      correo: data.correo.trim().toLowerCase(),
      nombreUsuario: data.nombreUsuario.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      fechaNacimiento: data.fechaNacimiento,
      descripcionBreve: data.descripcionBreve.trim(),
      imagenPerfilUrl: data.imagenPerfilUrl,
      perfil: data.perfil || UserProfile.Usuario,
      habilitado: true,
    });

    return user.save();
  }

  /*
    Convierte un documento de MongoDB en una respuesta segura para el frontend.

    Esto evita devolver:
    - passwordHash
    - datos internos innecesarios de Mongoose
  */
  toUserResponse(user: UserDocument): UserResponse {
    return {
      id: String(user._id),
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      fechaNacimiento: user.fechaNacimiento,
      descripcionBreve: user.descripcionBreve,
      imagenPerfilUrl: user.imagenPerfilUrl,
      perfil: user.perfil,
      habilitado: user.habilitado,
    };
  }
}