import { dbOptions } from '@db';
import { throwError } from '@helpers';
import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { v4 } from 'uuid';
import {
  Cart,
  cartItemTableName,
  cartTableName,
} from '../models';
import * as _ from 'lodash';
import AWS from 'aws-sdk';
const lambda = new AWS.Lambda();

@Injectable()
export class CartService {
  async findByUserId(userId: string): Promise<Cart> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const query = `
      SELECT "id" 
      FROM ${cartTableName} 
      WHERE "user_id" = $1
      ;`;
      const values = [userId];

      const cartId: string = (await dbClient.query(query, values))?.rows?.[0]
        ?.id;
      if (!cartId) return undefined;

      const queryItems = `
      SELECT "product_id", "count" 
      FROM ${cartItemTableName} 
      WHERE "cart_id" = $1
      ;`;
      const valuesItems = [cartId];

      const items: { product_id: string; count: number }[] = (
        await dbClient.query(queryItems, valuesItems)
      )?.rows;

      const { Payload } = await lambda
        .invoke({
          FunctionName: process.env.GET_PRODUCT_LIST_LAMBDA_ARN,
        })
        .promise();

      const { body } = JSON.parse(Payload as string);
      const productList: {
        id: string;
        title: string;
        description: string;
        price: number;
        count: number;
      }[] = JSON.parse(body).products;

      const ixProductList = _.keyBy(productList, 'id');

      const res: Cart = {
        id: cartId,
        items: items.length
          ? items.map(item => ({
              product: { ...ixProductList[item.product_id], count: undefined },
              count: item.count,
            }))
          : [],
      };
      return res;
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async createByUserId(userId: string) {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const id = v4();

      const query = `
      INSERT INTO ${cartTableName}("id", "user_id")
      VALUES ($1, $2);
      `;
      const values = [id, userId];

      await dbClient.query(query, values);

      return await this.findByUserId(userId);
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const { id: cartId, ...rest } = await this.findOrCreateByUserId(userId);

      const updatedCart = {
        id: cartId,
        ...rest,
        items: [...items],
      };

      const productIdsForDelete = updatedCart.items.map(
        item => `'${item.product.id}'`,
      );
      const queryDelete = `
      DELETE FROM ${cartItemTableName}
      WHERE 
      "cart_id" = $1
      AND
      "product_id" IN (${productIdsForDelete.join(', ')})
      ;`;
      const valuesDelete = [cartId];
      await dbClient.query(queryDelete, valuesDelete);

      let queryInsert = `
      INSERT INTO ${cartItemTableName} ("cart_id", "product_id", "count")
      VALUES \n`;
      updatedCart.items.forEach(item => {
        queryInsert += `($1, '${item.product.id}', '${item.count}'),`;
      });
      queryInsert = queryInsert.slice(0, -1); // remove comma
      const valuesInsert = [cartId];
      await dbClient.query(queryInsert, valuesInsert);

      return await this.findByUserId(userId);
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async removeByUserId(userId): Promise<void> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const queryFind = `
      SELECT "id" from ${cartTableName}
      WHERE "user_id" = $1;
      `;
      const valuesFind = [userId];

      const { id: cartId } = (
        await dbClient.query(queryFind, valuesFind)
      )?.rows?.[0];
      if (!cartId) return;

      const queryDeleteCartItem = `
      DELETE FROM ${cartItemTableName}
      WHERE "cart_id" = $1;
      `;
      const valuesDeleteCartItem = [cartId];

      await dbClient.query(queryDeleteCartItem, valuesDeleteCartItem);
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }
}
