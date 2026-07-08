/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  // Acá inyecto el modelo para usar findOne, create, save y el resto de métodos de Mongoose.
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /*
    Acá busco un usuario por correo.

    Lo uso para validar que no exista otro usuario con el mismo correo
    antes de registrar uno nuevo.

    Normalizo a minúsculas porque en el schema también guardo:
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
    Acá busco un usuario por nombre de usuario.

    Lo uso para validar que no exista otro usuario con el mismo nombreUsuario
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

  async findById(id: string): Promise<UserDocument | null> 
  {
    // Si el id no tiene formato ObjectId, corto rápido y devuelvo null.
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).exec();
  }

  async findAllUsers(): Promise<UserDocument[]> 
  {
    // Acá devuelvo primero los usuarios más recientes.
    return this.userModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async setUserEnabled(id: string, habilitado: boolean,): Promise<UserDocument | null> 
  {
    // Valido formato para no ejecutar una query inválida.
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          habilitado,
        },
        {
          new: true,
        },
      )
      .exec();
  }

  /*
    Acá busco un usuario por correo o nombre de usuario.

    Este método lo uso en login.

    Como passwordHash tiene select: false en el schema, normalmente no viene
    en las consultas. Pero para login necesito comparar la contraseña
    ingresada con el hash guardado.

    Por eso uso:
    .select('+passwordHash')

    Eso le dice a Mongoose:
    "en esta consulta puntual sí necesito traer passwordHash".
  */
  async findByUsuarioOCorreoWithPassword(usuarioOCorreo: string): Promise<UserDocument | null> 
  {
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
    Acá creo un usuario en MongoDB.

    Este método recibe datos ya preparados:
    - passwordHash ya viene hasheada.
    - fechaNacimiento ya viene convertida a Date.
    - imagenPerfilUrl ya viene generada.

    Mi responsabilidad en este service es guardar el usuario.
  */
  async createUser(data: CreateUserData): Promise<UserDocument> 
  {
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
    Acá convierto un documento de MongoDB en una respuesta segura para el frontend.

    Así evito devolver:
    - passwordHash
    - datos internos innecesarios de Mongoose
  */
  toUserResponse(user: UserDocument): UserResponse 
  {
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