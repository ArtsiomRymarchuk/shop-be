import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseError, formatResponseOK } from '@helpers';
import { isUUID } from 'validator';
import { CartController } from 'src/cart/cart.controller';
import { CartService } from 'src/cart';
import { OrderService } from 'src/order';
import { AppRequest } from 'src/shared';

export const findUserCart = async (event: APIGatewayEvent) => {
  console.log(`Lambda findUserCart is invoked!`, event);
  try {
    const { userId } = event.pathParameters;
    if (!isUUID(userId)) throwError('Not valid userId', 400);

    const cartController = new CartController(
      new CartService(),
      new OrderService(),
    );

    const { data } = await cartController.findUserCart({
      user: {
        id: userId,
      },
    } as AppRequest);

    return formatResponseOK(data);
  } catch (e) {
    return formatResponseError(e);
  }
};
