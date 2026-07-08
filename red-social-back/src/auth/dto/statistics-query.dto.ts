/* eslint-disable prettier/prettier */
import { IsDateString, IsOptional } from 'class-validator';

/*
  Acá defino la query para estadísticas.

  Me permite elegir un lapso de tiempo:
  - from: fecha inicial
  - to: fecha final

  Ejemplo:
  /api/statistics/posts-by-user?from=2026-01-01&to=2026-12-31
*/
export class StatisticsQueryDto 
{
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe tener formato válido.' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe tener formato válido.' })
  to?: string;
}