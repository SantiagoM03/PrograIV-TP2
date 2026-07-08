/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';

export class ListPostsQueryDto {
  /*
    Acá defino el ordenamiento:
    - fecha: últimas publicaciones primero.
    - likes: publicaciones con más me gusta primero.
  */
  @IsOptional()
  @IsIn(['fecha', 'likes'], {
    message: 'El ordenamiento debe ser fecha o likes.',
  })
  orderBy?: 'fecha' | 'likes';

  /*
    Acá permito filtrar publicaciones de un usuario puntual.
  */
  @IsOptional()
  @IsMongoId({ message: 'El userId debe ser un ObjectId válido.' })
  userId?: string;

  /*
    Acá recibo el offset para paginar.
  */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero.' })
  @Min(0, { message: 'El offset no puede ser menor a 0.' })
  offset?: number;

  /*
    Acá recibo el limit para paginar.
  */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero.' })
  @Min(1, { message: 'El limit debe ser al menos 1.' })
  limit?: number;
}