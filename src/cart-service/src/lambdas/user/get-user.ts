import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseError, formatResponseOK } from '@helpers';
import { UsersService } from 'src/users';
import { isUUID } from 'validator';

export const getUser = async (event: APIGatewayEvent) => {
  console.log(`Lambda getUser is invoked!`, event);
  try {
    const { id } = event.pathParameters;
    if (!isUUID(id)) throwError('Not valid ID', 400);

    const usersService = new UsersService();
    const user = await usersService.findOne(id);
    return formatResponseOK(user);
  } catch (e) {
    return formatResponseError(e);
  }
};
