import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseError, formatResponseOK } from '@helpers';
import { isUUID } from 'validator';
import { OrderService } from 'src/order';

export const getOrder = async (event: APIGatewayEvent) => {
  console.log(`Lambda getOrder is invoked!`, event);
  try {
    const { id } = event.pathParameters;
    if (!isUUID(id)) throwError('Not valid ID', 400);

    const orderService = new OrderService();
    const user = await orderService.findById(id);
    return formatResponseOK(user);
  } catch (e) {
    return formatResponseError(e);
  }
};
