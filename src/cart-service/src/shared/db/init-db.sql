-- users
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" VARCHAR ( 50 ) UNIQUE NOT NULL,
	"email" VARCHAR ( 255 ) UNIQUE,
	"password" VARCHAR ( 50 ) NOT NULL
);
INSERT INTO "users" ("id", "name", "email", "password") 
	VALUES 
	('9ae6f337-87c8-4c27-b36e-bbd10df2221f', 'Maria', 'Maria@mail.fast', 'secret_password'), 
	('bb05ed83-cfcf-4690-a5e1-fd83f7b77edc', 'Peter', null , 'peterParker1999'),  
	('59904ebf-7173-45fa-a752-8f833077e41c', 'Ilya', 'helloWorld@code.com', 'youBetterNotToKnowIt');

-- carts
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid REFERENCES "users" ("id") UNIQUE NOT NULL,
	"created_at" timestamp NOT NULL default now(),
	"updated_at" timestamp NOT NULL default now()
);
INSERT INTO "carts" ("id", "user_id", "created_at", "updated_at") 
	VALUES 
	('5f39884c-af73-4f02-be89-95eb7825c78e', '59904ebf-7173-45fa-a752-8f833077e41c', current_timestamp, current_timestamp), 
	('107066ee-ee78-4188-b6ed-614c626579f4', '9ae6f337-87c8-4c27-b36e-bbd10df2221f', current_timestamp, current_timestamp); 

-- cart_items
CREATE TABLE IF NOT EXISTS "cart_items" (
	"cart_id" uuid REFERENCES "carts" ("id") NOT NULL,
	"product_id" uuid NOT NULL,
	"count" integer NOT NULL
);
INSERT INTO "cart_items" ("cart_id", "product_id", "count") 
	VALUES 
	('5f39884c-af73-4f02-be89-95eb7825c78e', 'beb8b148-73e3-4cf0-b948-f8c817b8c1b1', 3), 
	('107066ee-ee78-4188-b6ed-614c626579f4', 'beb8b148-73e3-4cf0-b948-f8c817b8c1b1', 6);

-- orders
CREATE TYPE "order_status" AS ENUM('paid', 'delivered');
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid REFERENCES "users" ("id"),
	"cart_id" uuid REFERENCES "carts" ("id"),
	"payment" JSON NOT NULL,
	"delivery" JSON NOT NULL,
	"comments" VARCHAR ( 255 ) NOT NULL,
	"status" order_status NOT NULL,
	"total" INTEGER NOT NULL
);
INSERT INTO "orders" ("id", "user_id", "cart_id", "payment", "delivery", "comments", "status", "total") 
	VALUES 
	('1bb2bb6c-be1d-49bf-add5-807b3fbaee6c', '59904ebf-7173-45fa-a752-8f833077e41c', '5f39884c-af73-4f02-be89-95eb7825c78e', '{"type":"card"}', '{"type":"PTT","address":"Izmir, Turkey"}', 'Please deliver the order to my office!', 'paid', 1000),
	('f8b4eceb-4317-40e0-99d4-47dc20ad1dd9', '9ae6f337-87c8-4c27-b36e-bbd10df2221f', '107066ee-ee78-4188-b6ed-614c626579f4', '{"type":"card"}', '{"type":"US Mail","address":"Cincinnati, Ohio, USA"}', 'Be careful please! It is a gift for my mom', 'delivered', 500);





