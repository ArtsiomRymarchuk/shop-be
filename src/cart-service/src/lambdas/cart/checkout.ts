import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseError, formatResponseOK } from '@helpers';
import { isUUID } from 'validator';
import { CartController } from 'src/cart/cart.controller';
import { CartService } from 'src/cart';
import { OrderService } from 'src/order';
import { AppRequest } from 'src/shared';

const validate = ({ comments, paymentType, deliveryType, deliveryAddress }) => {
  if (!comments || typeof comments !== 'string')
    throwError('Not valid comments', 400);
  if (!paymentType || typeof paymentType !== 'string')
    throwError('Not valid paymentType', 400);
  if (!deliveryType || typeof deliveryType !== 'string')
    throwError('Not valid deliveryType', 400);
  if (!deliveryAddress || typeof deliveryAddress !== 'string')
    throwError('Not valid deliveryAddress', 400);
};

export const checkout = async (event: APIGatewayEvent) => {
  console.log(`Lambda checkout is invoked!`, event);
  try {
    const { userId } = event.pathParameters;
    if (!userId || !isUUID(userId)) throwError('Not valid userId', 400);
    const data: {
      comments: string;
      paymentType: string;
      paymentAddress?: any;
      paymentCreditCard?: any;
      deliveryType: string;
      deliveryAddress: string;
    } = JSON.parse(event.body);
    validate(data);

    const cartController = new CartController(
      new CartService(),
      new OrderService(),
    );

    const { data: res } = await cartController.checkout(
      {
        user: {
          id: userId,
        },
      } as AppRequest,
      {
        comments: data.comments,
        payment: JSON.stringify({
          type: data.paymentType,
          address: data.paymentAddress,
          creditCard: data.paymentCreditCard,
        }),
        delivery: JSON.stringify({
          type: data.deliveryType,
          address: data.deliveryAddress,
        }),
      },
    );

    return formatResponseOK(res);
  } catch (e) {
    return formatResponseError(e);
  }
};
