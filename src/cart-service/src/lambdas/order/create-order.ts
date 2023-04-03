import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseOK, formatResponseError } from '@helpers';
import { isUUID } from 'validator';
import { OrderRequest, OrderService, OrderStatusEnum } from 'src/order';

export const createOrder = async (event: APIGatewayEvent) => {
  console.log(`Lambda createOrder is invoked!`, event);
  try {
    const data: OrderRequest = JSON.parse(event.body);
    const { userId, cartId, payment, delivery, comments, status, total } = data;

    if (!userId || !isUUID(userId)) throwError('Not valid userId', 400);
    if (!cartId || !isUUID(cartId)) throwError('Not valid cartId', 400);
    if (!payment) throwError('Not valid payment', 400);
    if (!payment.type || typeof payment.type !== 'string')
      throwError('Not valid payment.type', 400);
    if (!delivery) throwError('Not valid delivery', 400);
    if (!delivery.type || typeof delivery.type !== 'string')
      throwError('Not valid delivery.type', 400);
    if (!delivery.address) throwError('Not valid delivery.address', 400);
    if (!comments || typeof comments !== 'string')
      throwError('Not valid comments', 400);
    if (!status || !Object.keys(OrderStatusEnum).includes(status))
      throwError('Not valid status', 400);
    if (!total || typeof total !== 'number') throwError('Not valid total', 400);

    const orderService = new OrderService();
    const order = await orderService.create({
      user_id: userId,
      cart_id: cartId,
      payment: JSON.stringify(payment),
      delivery: JSON.stringify(delivery),
      comments,
      status,
      total,
    });

    return formatResponseOK({ order }, 201);
  } catch (e) {
    return formatResponseError(e);
  }
};
