import { Injectable } from '@nestjs/common';
import { dbOptions } from '@db';
import { throwError } from 'src/shared/helpers';
import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';

import { User, userTableName, userTableValues } from '../models';
import { Client } from 'pg';

@Injectable()
export class UsersService {
  async findOne(userId: string): Promise<User> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const query = `
      SELECT id, name, email 
      FROM ${userTableName} 
      WHERE id = $1
      ;`;
      const values = [userId];

      const { rows: res } = await dbClient.query(query, values);
      return res?.[0] as User;
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }

  async createOne(data: User): Promise<string> {
    const dbClient = new Client(dbOptions);
    try {
      await dbClient.connect();

      const { name, email } = data;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const id = v4();

      const query = `
      INSERT INTO ${userTableName}(${userTableValues})
      VALUES ($1, $2, $3, $4);
      `;
      const values = [id, name, email, hashedPassword];

      await dbClient.query(query, values);

      return id;
    } catch (e) {
      throwError(e, 502);
    } finally {
      dbClient.end();
    }
  }
}
