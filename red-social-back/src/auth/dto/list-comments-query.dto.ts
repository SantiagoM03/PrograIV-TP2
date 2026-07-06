/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListCommentsQueryDto 
{
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero.' })
  @Min(0, { message: 'El offset no puede ser menor a 0.' })
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero.' })
  @Min(1, { message: 'El limit debe ser al menos 1.' })
  limit?: number;
}