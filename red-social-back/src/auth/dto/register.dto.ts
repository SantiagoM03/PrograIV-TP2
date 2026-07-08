/* eslint-disable prettier/prettier */
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserProfile } from '../../users/schemas/user.schema';

export class RegisterDto 
{
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(40, { message: 'El nombre no puede superar los 40 caracteres.' })
  nombre!: string;

  @IsString({ message: 'El apellido debe ser un texto.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  @MaxLength(40, { message: 'El apellido no puede superar los 40 caracteres.' })
  apellido!: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  correo!: string;

  @IsString({ message: 'El nombre de usuario debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  @MinLength(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres.'})
  @MaxLength(24, {message: 'El nombre de usuario no puede superar los 24 caracteres.'})
  @Matches(/^[a-zA-Z0-9._]+$/, {message:'El nombre de usuario solo puede tener letras, números, puntos o guiones bajos.'})
  nombreUsuario!: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {message:'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.'})
  password!: string; // Acá recibo la contraseña sin encriptar y en AuthService la convierto a hash con bcrypt.

  @IsString({ message: 'La repetición de contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'Tenés que repetir la contraseña.' })
  repetirPassword!: string;

  @IsDateString({},{ message: 'La fecha de nacimiento debe ser una fecha válida.' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria.' })
  fechaNacimiento!: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción breve es obligatoria.' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.'})
  @MaxLength(180, {message: 'La descripción no puede superar los 180 caracteres.'})
  descripcionBreve!: string;

  @IsOptional() // Acá lo dejo opcional porque, si no llega, el backend asigna "usuario" por default.
  @IsEnum(UserProfile, {message: 'El perfil debe ser usuario o administrador.'})
  perfil?: UserProfile;
}