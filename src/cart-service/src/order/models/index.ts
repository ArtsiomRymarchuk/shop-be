import { CartItem } from '../../cart/models';

export type Order = {
  id?: string;
  userId: string;
  cartId: string;
  items: CartItem[];
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };
  delivery: {
    type: string;
    address: any;
  };
  comments: string;
  status: OrderStatusEnum;
  total: number;
};

export type OrderRequest = {
  userId: string;
  cartId: string;
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };
  delivery: {
    type: string;
    address: any;
  };
  comments: string;
  status: OrderStatusEnum;
  total: number;
};

export type OrderEntity = {
  id: string;
  user_id: string;
  cart_id: string;
  payment: string; //JSON
  delivery: string; //JSON
  comments: string;
  status: OrderStatusEnum;
  total: number;
};

export enum OrderStatusEnum {
  'paid' = 'paid',
  'delivered' = 'delivered',
}

export const orderTableName = '"orders"';

export const orderTableValues =
  'id, user_id, cart_id, payment, delivery, comments, status, total';

export const orderTableValuesModified =
  'id, user_id as "userId", cart_id as "cartId", payment, delivery, comments, status, total';
