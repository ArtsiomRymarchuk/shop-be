import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { dbOptions } from '@db';
import {
  OrderEntity,
  OrderStatusEnum,
  orderTableName,
  orderTableValues,
  orderTableValuesModified,
} from '../models';
import { throwError } from '@helpers';
import { Client } from 'pg';

@Injectable()
export class OrderService {
  async findById(orderId: string): Promise<OrderEntity> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const query = `
      SELECT ${orderTableValuesModified} 
      FROM ${orderTableName} 
      WHERE "id" = $1
      ;`;
      const values = [orderId];

      const res: OrderEntity = (await dbClient.query(query, values)).rows[0];

      return res;
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async create(data: Omit<OrderEntity, 'id'>): Promise<OrderEntity> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const {
        user_id,
        cart_id,
        payment,
        delivery,
        comments,
        status,
        total,
      } = data;
      const id = v4();

      const query = `
      INSERT INTO ${orderTableName}(${orderTableValues})
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      const values = [
        id,
        user_id,
        cart_id,
        payment,
        delivery,
        comments,
        status,
        total,
      ];

      await dbClient.query(query, values);

      return { ...data, id };
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async update(
    orderId: string,
    data: {
      delivery?: string;
      comments?: string;
      status?: OrderStatusEnum;
    },
  ): Promise<void> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();
      const { delivery, comments, status } = data;

      let query = `
      UPDATE ${orderTableName}
      SET \n`;
      if (delivery) query += `"delivery" = '${delivery}',`;
      if (comments) query += `"comments" = '${comments}',`;
      if (status) query += `"status" = '${status}',`;
      query = query.slice(0, -1); // remove comma
      query += `\n WHERE "id" = $1;`;
      const values = [orderId];

      await dbClient.query(query, values);
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }
}
