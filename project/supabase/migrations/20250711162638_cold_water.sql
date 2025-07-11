/*
  # Fix RLS Policy Infinite Recursion

  1. Security Updates
    - Drop existing problematic policies that cause infinite recursion
    - Create simplified, non-recursive policies for users table
    - Ensure policies use auth.uid() directly without subqueries to users table

  2. Policy Changes
    - Users can read their own data using direct auth.uid() comparison
    - Users can update their own data using direct auth.uid() comparison
    - Admins can manage all users using a simple role check without recursive queries
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- For admin operations, we'll use a simpler approach
-- This policy allows users with admin role to read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
    OR auth.uid() = id
  );

-- This policy allows users with admin role to manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow authenticated users to insert their own record during signup
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);