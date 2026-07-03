/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto 
{

  @IsString({ message: 'El correo o nombre de usuario debe ser un texto.' })
  @IsNotEmpty({ message: 'El correo o nombre de usuario es obligatorio.' })
  @MinLength(3, { message: 'Debe tener al menos 3 caracteres.' })
  usuarioOCorreo!: string;

  /*
    Contraseña plana enviada desde el frontend.

    No se encripta en el DTO.
    Se compara en el service contra el hash guardado en MongoDB.
  */
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password!: string;
}