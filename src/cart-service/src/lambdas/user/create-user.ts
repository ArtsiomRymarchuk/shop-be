import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseOK, formatResponseError } from '@helpers';
import { UsersService } from 'src/users';
import { isEmail } from 'validator';

export const createUser = async (event: APIGatewayEvent) => {
  console.log(`Lambda createUser is invoked!`, event);
  try {
    const data = JSON.parse(event.body);
    const { name, email, password } = data;

    if (!name || typeof name !== 'string') throwError('Not valid name', 400);
    if (!password || typeof password !== 'string')
      throwError('Not valid password', 400);
    if (email && !isEmail(email)) throwError('Not valid email', 400);

    const usersService = new UsersService();
    const userId = await usersService.createOne({ name, email, password });
    return formatResponseOK({ message: `User ${userId} was created` }, 201);
  } catch (e) {
    return formatResponseError(e);
  }
};
