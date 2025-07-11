/*
  # Fix User Permissions and RLS Policies

  1. Security Updates
    - Drop existing problematic policies
    - Create proper RLS policies for users table
    - Ensure authenticated users can read their own data
    - Allow user insertion during signup

  2. Policy Structure
    - Users can read their own data
    - Users can insert their own data during signup
    - Users can update their own data
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create simple, working policies
CREATE POLICY "Enable read access for users based on user_id"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy (simplified - will need to be set via user metadata or separate admin table)
CREATE POLICY "Enable all access for service role"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);