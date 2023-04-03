import { APIGatewayEvent } from 'aws-lambda';
import { throwError, formatResponseOK, formatResponseError } from '@helpers';
import { OrderService, OrderStatusEnum } from 'src/order';
import { isUUID } from 'validator';

export const updateOrder = async (event: APIGatewayEvent) => {
  console.log(`Lambda updateOrder is invoked!`, event);
  try {
    const data: {
      delivery?: {
        type: string;
        address: any;
      };
      comments?: string;
      status?: OrderStatusEnum;
    } = JSON.parse(event.body);
    const { id: orderId } = event.pathParameters;
    const { delivery, comments, status } = data;

    if (!orderId || !isUUID(orderId)) throwError('Not valid orderId', 400);
    if (delivery.type && typeof delivery.type !== 'string')
      throwError('Not valid delivery.type', 400);
    if (comments && typeof comments !== 'string')
      throwError('Not valid comments', 400);
    if (status && !Object.keys(OrderStatusEnum).includes(status))
      throwError('Not valid status', 400);
    if (!delivery && !comments && !status)
      throwError("You haven't passed parameters to update", 400);

    const orderService = new OrderService();

    const order = await orderService.findById(orderId);
    if (!order) throwError("Order doesn't exist", 404);

    await orderService.update(orderId, {
      delivery: delivery ? JSON.stringify(delivery) : undefined,
      comments: comments || undefined,
      status: status || undefined,
    });

    return formatResponseOK();
  } catch (e) {
    return formatResponseError(e);
  }
};
