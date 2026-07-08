/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// Acá valido el texto cuando edito un comentario.
export class UpdateCommentDto 
{
  @IsString({ message: 'El comentario debe ser un texto.' })
  @IsNotEmpty({ message: 'El comentario es obligatorio.' })
  @MinLength(1, { message: 'El comentario debe tener al menos 1 carácter.' })
  @MaxLength(500, {
    message: 'El comentario no puede superar los 500 caracteres.',
  })
  text!: string;
}