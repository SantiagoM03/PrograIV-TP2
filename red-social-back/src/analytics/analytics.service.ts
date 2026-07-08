/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AnalyticsEvent,
  AnalyticsEventDocument,
  AnalyticsEventType,
} from './schemas/analytics-event.schema';
import { StatisticsQueryDto } from '../auth/dto/statistics-query.dto';
import { UserResponse } from '../users/users.service';

export interface AnalyticsPostInfo {
  id: string;
  title: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsEvent.name)
    private readonly analyticsEventModel: Model<AnalyticsEventDocument>,
  ) {}

  async recordLogin(user: UserResponse): Promise<void> {
    await this.analyticsEventModel.create({
      type: AnalyticsEventType.Login,
      actorUserId: new Types.ObjectId(user.id),
      actorNombreUsuario: user.nombreUsuario,
      actorNombreCompleto: `${user.nombre} ${user.apellido}`,
      targetUserId: null,
      targetNombreUsuario: null,
      targetNombreCompleto: null,
      postId: null,
      postTitle: null,
    });
  }

  async recordProfileVisit(
    visitor: UserResponse,
    profileOwner: UserResponse,
  ): Promise<void> {
    /*
      Sprint 5 pide visitas a mi perfil por parte de usuarios
      que no sean uno mismo.

      Si el usuario entra a su propio perfil, no registro visita.
    */
    if (visitor.id === profileOwner.id) {
      return;
    }

    await this.analyticsEventModel.create({
      type: AnalyticsEventType.ProfileVisit,
      actorUserId: new Types.ObjectId(visitor.id),
      actorNombreUsuario: visitor.nombreUsuario,
      actorNombreCompleto: `${visitor.nombre} ${visitor.apellido}`,
      targetUserId: new Types.ObjectId(profileOwner.id),
      targetNombreUsuario: profileOwner.nombreUsuario,
      targetNombreCompleto: `${profileOwner.nombre} ${profileOwner.apellido}`,
      postId: null,
      postTitle: null,
    });
  }

  async recordLikeGiven(
    user: UserResponse,
    post: AnalyticsPostInfo,
  ): Promise<void> {
    await this.analyticsEventModel.create({
      type: AnalyticsEventType.LikeGiven,
      actorUserId: new Types.ObjectId(user.id),
      actorNombreUsuario: user.nombreUsuario,
      actorNombreCompleto: `${user.nombre} ${user.apellido}`,
      targetUserId: null,
      targetNombreUsuario: null,
      targetNombreCompleto: null,
      postId: new Types.ObjectId(post.id),
      postTitle: post.title,
    });
  }

  async getLoginsByUserStats(query: StatisticsQueryDto): Promise<
    {
      userId: string;
      nombreUsuario: string;
      nombreCompleto: string;
      totalIngresos: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.analyticsEventModel
      .aggregate<{
        _id: Types.ObjectId;
        nombreUsuario: string;
        nombreCompleto: string;
        totalIngresos: number;
      }>([
        {
          $match: {
            type: AnalyticsEventType.Login,
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: '$actorUserId',
            nombreUsuario: { $first: '$actorNombreUsuario' },
            nombreCompleto: { $first: '$actorNombreCompleto' },
            totalIngresos: { $sum: 1 },
          },
        },
        {
          $sort: {
            totalIngresos: -1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      userId: String(item._id),
      nombreUsuario: item.nombreUsuario,
      nombreCompleto: item.nombreCompleto,
      totalIngresos: item.totalIngresos,
    }));
  }

  async getProfileVisitsStats(query: StatisticsQueryDto): Promise<
    {
      userId: string;
      nombreUsuario: string;
      nombreCompleto: string;
      totalVisitas: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.analyticsEventModel
      .aggregate<{
        _id: Types.ObjectId;
        nombreUsuario: string;
        nombreCompleto: string;
        totalVisitas: number;
      }>([
        {
          $match: {
            type: AnalyticsEventType.ProfileVisit,
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: '$targetUserId',
            nombreUsuario: { $first: '$targetNombreUsuario' },
            nombreCompleto: { $first: '$targetNombreCompleto' },
            totalVisitas: { $sum: 1 },
          },
        },
        {
          $sort: {
            totalVisitas: -1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      userId: String(item._id),
      nombreUsuario: item.nombreUsuario,
      nombreCompleto: item.nombreCompleto,
      totalVisitas: item.totalVisitas,
    }));
  }

  async getLikesByDayStats(query: StatisticsQueryDto): Promise<
    {
      date: string;
      totalMeGusta: number;
    }[]
  > {
    const { fromDate, toDate } = this.getDateRange(query);

    const results = await this.analyticsEventModel
      .aggregate<{
        _id: string;
        totalMeGusta: number;
      }>([
        {
          $match: {
            type: AnalyticsEventType.LikeGiven,
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            totalMeGusta: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .exec();

    return results.map((item) => ({
      date: item._id,
      totalMeGusta: item.totalMeGusta,
    }));
  }

  private getDateRange(query: StatisticsQueryDto): {
    fromDate: Date;
    toDate: Date;
  } {
    const now = new Date();

    const defaultFromDate = new Date();
    defaultFromDate.setDate(now.getDate() - 30);

    const fromDate = query.from ? new Date(query.from) : defaultFromDate;
    const toDate = query.to ? new Date(query.to) : now;

    toDate.setHours(23, 59, 59, 999);

    return {
      fromDate,
      toDate,
    };
  }
}