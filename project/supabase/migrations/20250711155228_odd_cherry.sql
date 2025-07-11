/*
  # Store Rating Application Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, 20-60 characters)
      - `email` (text, unique)
      - `address` (text, max 400 characters)
      - `role` (text, enum: 'admin', 'user', 'store_owner')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text, 20-60 characters)
      - `email` (text, unique)
      - `address` (text, max 400 characters)
      - `owner_id` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `store_id` (uuid, references stores)
      - `rating` (integer, 1-5)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admins can manage all data
    - Users can only access their own data and public store info
    - Store owners can access their store data and ratings

  3. Indexes
    - Add indexes for common queries (email, role, store ratings)
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  address text NOT NULL CHECK (length(address) <= 400),
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  address text NOT NULL CHECK (length(address) <= 400),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for stores table
CREATE POLICY "Everyone can read stores" ON stores
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Store owners can update own stores" ON stores
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all stores" ON stores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for ratings table
CREATE POLICY "Users can read all ratings" ON ratings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own ratings" ON ratings
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Store owners can read their store ratings" ON ratings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s 
      WHERE s.id = store_id AND s.owner_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();