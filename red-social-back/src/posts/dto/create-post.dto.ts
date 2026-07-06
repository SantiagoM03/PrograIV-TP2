/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto 
{
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres.' })
  title!: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  })
  @MaxLength(1000, {
    message: 'La descripción no puede superar los 1000 caracteres.',
  })
  description!: string;
}