-- Task Manager Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  board_id TEXT NOT NULL DEFAULT 'default-board',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  board_id TEXT NOT NULL DEFAULT 'default-board',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can select columns" ON columns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert columns" ON columns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update columns" ON columns
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete columns" ON columns
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can select tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable Realtime for columns and tasks tables
ALTER PUBLICATION supabase_realtime ADD TABLE columns;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Insert default columns
INSERT INTO columns (title, "order", board_id) VALUES 
  ('To Do', 0, 'default-board'),
  ('In Progress', 1, 'default-board'),
  ('Done', 2, 'default-board')
ON CONFLICT DO NOTHING;
