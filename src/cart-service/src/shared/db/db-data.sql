CREATE TYPE status_type AS ENUM ('OPEN', 'ORDERED');
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at date NOT null,
  updated_at date NOT null,
  status status_type
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id uuid REFERENCES carts,
  count integer NOT NULL
);
ALTER TABLE cart_items
ADD product_id uuid references products;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  cart_id uuid references carts,
  payment json,
  delivery json,
  comments text,
  status text,
  total integer
);

INSERT INTO cart_items (cart_id, product_id, count)
VALUES 
('f4d601c4-f6e3-4aa4-a7e1-6c6042a8a56d', '8ac6a830-abf9-48eb-979e-6fd1dc7fd745', 4),
('d6fc56df-4451-4a30-a37d-df1b959ba12b', '84ddbf9f-4197-4a2f-a15f-23287c40c9e3', 6),
('0a1ced9b-d7da-45bd-94d4-249bc3fe13ed', '17f8122c-b8ca-4e9a-a9b4-0651f89d59c4', 7),
('62f66596-6741-4cf0-a259-2ab8697c1740', 'e0331103-1a7c-48a7-97fb-e4fd12f82fec', 8),
('559910a1-765c-4155-a55d-769231fbac43', 'c36d2edb-0b39-4906-ab83-330f79942578', 2)

INSERT INTO carts (id, user_id, created_at, updated_at, status)
VALUES 
('f4d601c4-f6e3-4aa4-a7e1-6c6042a8a56d', '234efba9-6ab9-44c8-91af-1f35856a522f', '2022-03-23', '2022-03-23', 'ORDERED'),
('d6fc56df-4451-4a30-a37d-df1b959ba12b', '2097496a-21f4-40c2-94b4-c773dcab9ce2', '2022-03-24', '2022-03-24', 'ORDERED'),
('0a1ced9b-d7da-45bd-94d4-249bc3fe13ed', 'd1fbc5ed-1131-4963-a276-1b79e16fae76', '2022-03-25', '2022-03-25', 'ORDERED'),
('62f66596-6741-4cf0-a259-2ab8697c1740', '826db26e-70dd-4333-8067-d9d98b442f32', '2022-03-26', '2022-03-26', 'OPEN'),
('559910a1-765c-4155-a55d-769231fbac43', '34f6fbf3-952c-4f74-97bd-1d0a40dfdd83', '2022-03-27', '2022-03-27', 'OPEN')

INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) 
	VALUES 
	('1bb2bb6c-be1d-49bf-add5-807b3fbaee6c', '826db26e-70dd-4333-8067-d9d98b442f32', '62f66596-6741-4cf0-a259-2ab8697c1740', '{"type":"card"}', '{"type":"PTT","address":"Izmir, Turkey"}', 'Please deliver the order to my office!', 'paid', 1000),
	('f8b4eceb-4317-40e0-99d4-47dc20ad1dd9', '826db26e-70dd-4333-8067-d9d98b442f32', '62f66596-6741-4cf0-a259-2ab8697c1740', '{"type":"card"}', '{"type":"US Mail","address":"Cincinnati, Ohio, USA"}', 'Be careful please! It is a gift for my mom', 'delivered', 500)



