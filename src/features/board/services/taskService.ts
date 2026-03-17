import { supabase } from '@/lib/supabase'
import { Column, Task } from '@/shared/types'
import { getAuthUserId } from '@/features/auth/store/authStore'

async function createDefaultColumns(userId: string) {
  await supabase.from('columns').insert([
    { title: 'To Do', order: 0, user_id: userId },
    { title: 'In Progress', order: 1, user_id: userId },
    { title: 'Done', order: 2, user_id: userId },
  ])
}

export async function getBoard() {
  const userId = getAuthUserId()
  if (!userId) throw new Error('User not authenticated')

  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('*')
    .eq('user_id', userId)
    .order('order')

  if (columnsError) throw columnsError

  if (!columns || columns.length === 0) {
    await createDefaultColumns(userId)

    const { data: newColumns } = await supabase
      .from('columns')
      .select('*')
      .eq('user_id', userId)
      .order('order')

    return { columns: newColumns as Column[], tasks: [] as Task[] }
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .in('column_id', columns.map((c) => c.id))
    .order('order')

  if (tasksError) throw tasksError

  return { columns: columns as Column[], tasks: tasks as Task[] }
}

export async function moveTask(
  taskId: string,
  newColumnId: string,
  newOrder: number
) {
  const { error } = await supabase
    .from('tasks')
    .update({ column_id: newColumnId, order: newOrder })
    .eq('id', taskId)

  if (error) throw error
}

export async function reorderTasksInColumn(
  _columnId: string,
  taskUpdates: { id: string; order: number }[]
) {
  const promises = taskUpdates.map((task) =>
    supabase.from('tasks').update({ order: task.order }).eq('id', task.id)
  )

  await Promise.all(promises)
}

export async function createTask(columnId: string, title: string) {
  const userId = getAuthUserId()
  if (!userId) throw new Error('User not authenticated')

  const { data: maxOrder } = await supabase
    .from('tasks')
    .select('order')
    .eq('column_id', columnId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const order = (maxOrder?.order ?? -1) + 1

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      column_id: columnId,
      order,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(
  taskId: string,
  updates: { title?: string; description?: string }
) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) throw error
}

export async function updateColumn(columnId: string, updates: { title?: string }) {
  const { data, error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', columnId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTasksInColumn(columnId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('column_id', columnId)

  if (error) throw error
}

export async function createColumn() {
  const userId = getAuthUserId()
  if (!userId) throw new Error('User not authenticated')

  const { data: maxOrder } = await supabase
    .from('columns')
    .select('order')
    .eq('user_id', userId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const order = (maxOrder?.order ?? -1) + 1

  const { data, error } = await supabase
    .from('columns')
    .insert({
      title: 'New Column',
      order,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data as Column
}

export async function deleteColumn(columnId: string) {
  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', columnId)

  if (error) throw error
}
