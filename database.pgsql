DROP DATABASE IF EXISTS launchstoredb;
CREATE DATABASE launchstoredb;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    user_id INT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    old_price INT,
    price INT NOT NULL,
    quantity INT DEFAULT 0,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT (now()),
    updated_at TIMESTAMP DEFAULT (now())
)

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
)

-- INSERTS ON categories TABLE

INSERT INTO categories (name) VALUES ('Comida')
INSERT INTO categories (name) VALUES ('Eletrônicos')
INSERT INTO categories (name) VALUES ('Automóvel')

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name TEXT,
    path TEXT NOT NULL,
    product_id INT
)

ALTER TABLE products ADD FOREIGN KEY (category_id) REFERENCES categories(id)
ALTER TABLE files ADD FOREIGN KEY (product_id) REFERENCES products(id)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    cpf_cnpj TEXT UNIQUE NOT NULL,
    cep TEXT,
    adress TEXT,
    created_at TIMESTAMP DEFAULT (now()),
    updated_at TIMESTAMP DEFAULT (now())
)

-- FOREING KEY

ALTER TABLE products ADD FOREIGN KEY (user_id) REFERENCES users(id)

-- PROCEDURE

CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$

    BEGIN

        NEW.updated_at = NOW();
        RETURN NEW;

    END;

$$ LANGUAGE plpgsql;

-- AUTO UPDATE "UPDATED_AT" TRIGGER products

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- AUTO UPDATE "UPDATED_AT" TRIGGER users

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- CREATES THE SESSION STORAGE TABLE

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- PASSWORD RECOVERY TOKEN IDEA

ALTER TABLE users
COLUMN reset_token TEXT;
  
ALTER TABLE users
ADD COLUMN reset_token_expires TEXT;

-- DROPPING CONSTRAINTS AND RECREATING THEM WITH A "ON DELETE CASCADE" ATTRIBUTE

ALTER TABLE products
DROP CONSTRAINT products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE files
DROP CONSTRAINT files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE;

-- CREATES ORDERS TABLE

CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL,
  buyer_id INT NOT NULL,
  product_id INT NOT NULL,
  price INT NOT NULL,
  quantity INT DEFAULT 0,
  total INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT (now()),
  updated_at TIMESTAMP DEFAULT(now())
);

ALTER TABLE orders ADD FOREIGN KEY (seller_id) REFERENCES users(id);
ALTER TABLE orders ADD FOREIGN KEY (buyer_id) REFERENCES users(id);
ALTER TABLE orders ADD FOREIGN KEY (product_id) REFERENCES products(id);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();