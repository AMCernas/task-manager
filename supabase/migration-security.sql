-- ============================================
-- SEGURIDAD MULTI-TENANT - Task App
-- Ejecutar en SQL Editor de Supabase
-- ============================================

-- 1. Agregar columnas user_id (sin NOT NULL aún)
ALTER TABLE columns ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Asignar user_id a datos existentes (usando el primer usuario)
UPDATE columns 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;

UPDATE tasks
SET user_id = (
  SELECT user_id FROM columns 
  WHERE columns.id = tasks.column_id 
  LIMIT 1
)
WHERE user_id IS NULL;

-- 3. Verificar que no haya NULLs
SELECT COUNT(*) as null_columns FROM columns WHERE user_id IS NULL;
SELECT COUNT(*) as null_tasks FROM tasks WHERE user_id IS NULL;

-- 4. Hacer user_id NOT NULL
ALTER TABLE columns ALTER COLUMN user_id SET NOT NULL;

-- 5. Políticas RLS para columns
DROP POLICY IF EXISTS "Users can select columns" ON columns;
DROP POLICY IF EXISTS "Users can insert columns" ON columns;
DROP POLICY IF EXISTS "Users can update columns" ON columns;
DROP POLICY IF EXISTS "Users can delete columns" ON columns;

CREATE POLICY "Users can select own columns" ON columns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own columns" ON columns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own columns" ON columns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own columns" ON columns
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Políticas RLS para tasks
DROP POLICY IF EXISTS "Users can select tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON tasks;

CREATE POLICY "Users can select own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LIMPIEZA: Eliminar trigger problemático
-- (Las columnas por defecto se crean desde el frontend)
-- ============================================

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_columns();
