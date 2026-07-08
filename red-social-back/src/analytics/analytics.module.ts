/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AnalyticsEvent,
  AnalyticsEventSchema,
} from './schemas/analytics-event.schema';
import { AnalyticsService } from './analytics.service';

/*
  Acá registro el esquema de analytics para poder guardar eventos
  y expongo AnalyticsService para que lo usen otros módulos.
*/
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AnalyticsEvent.name,
        schema: AnalyticsEventSchema,
      },
    ]),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}