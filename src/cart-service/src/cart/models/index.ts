export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type CartItem = {
  product: Product;
  count: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export type CartEntity = {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

export const cartTableName = '"carts"';

export const cartItemTableName = '"cart_items"';
