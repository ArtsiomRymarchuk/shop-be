import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseError, formatResponseOK } from '@helpers';
import { isUUID } from 'validator';
import { CartController } from 'src/cart/cart.controller';
import { Cart, CartService } from 'src/cart';
import { OrderService } from 'src/order';
import { AppRequest } from 'src/shared';

const validate = (data: Cart) => {
  const { id, items } = data;
  if (!id || !isUUID(id)) throwError('Not valid data.id', 400);
  if (!items || !items.length) throwError('Not valid data.items', 400);
  items.forEach(item => {
    const { product, count } = item;
    if (!product) throwError('Not valid data.items.product', 400);
    if (!count || typeof count !== 'number')
      throwError('Not valid data.items.count', 400);

    const { id: productId, title, description, price } = product;
    if (!productId || !isUUID(productId))
      throwError('Not valid data.items.product.id', 400);
    if (!title || typeof title !== 'string')
      throwError('Not valid data.items.product.title', 400);
    if (!description || typeof description !== 'string')
      throwError('Not valid data.items.product.description', 400);
    if (!price || typeof price !== 'number')
      throwError('Not valid data.items.product.price', 400);
  });
};

export const updateUserCart = async (event: APIGatewayEvent) => {
  console.log(`Lambda updateUserCart is invoked!`, event);
  try {
    const { userId } = event.pathParameters;
    if (!isUUID(userId)) throwError('Not valid userId', 400);
    const data: Cart = JSON.parse(event.body);
    validate(data);

    const cartController = new CartController(
      new CartService(),
      new OrderService(),
    );

    const { data: res } = await cartController.updateUserCart(
      {
        user: {
          id: userId,
        },
      } as AppRequest,
      data,
    );

    return formatResponseOK(res);
  } catch (e) {
    return formatResponseError(e);
  }
};
