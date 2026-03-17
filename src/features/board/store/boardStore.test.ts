import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from './boardStore'
import { Task, Column } from '@/shared/types'

const mockColumn: Column = {
  id: 'col-1',
  title: 'To Do',
  order: 0,
  board_id: 'default-board',
  created_at: new Date().toISOString(),
}

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  column_id: 'col-1',
  order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('useBoardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ columns: [], tasks: [] })
  })

  describe('setBoard', () => {
    it('sets columns and tasks', () => {
      const columns = [mockColumn]
      const tasks = [mockTask]

      useBoardStore.getState().setBoard(columns, tasks)

      expect(useBoardStore.getState().columns).toEqual(columns)
      expect(useBoardStore.getState().tasks).toEqual(tasks)
    })
  })

  describe('moveTaskOptimistic', () => {
    it('moves task to new column', () => {
      const columns = [mockColumn, { ...mockColumn, id: 'col-2', order: 1 }]
      const tasks = [mockTask]

      useBoardStore.getState().setBoard(columns, tasks)
      useBoardStore.getState().moveTaskOptimistic('task-1', 'col-1', 'col-2', 0)

      const updatedTask = useBoardStore.getState().tasks.find((t) => t.id === 'task-1')
      expect(updatedTask?.column_id).toBe('col-2')
      expect(updatedTask?.order).toBe(0)
    })
  })

  describe('reorderTasksOptimistic', () => {
    it('reorders tasks in column', () => {
      const columns = [mockColumn]
      const tasks = [
        { ...mockTask, id: 'task-1' },
        { ...mockTask, id: 'task-2' },
        { ...mockTask, id: 'task-3' },
      ]

      useBoardStore.getState().setBoard(columns, tasks)
      useBoardStore.getState().reorderTasksOptimistic('col-1', ['task-3', 'task-1', 'task-2'])

      const updatedTasks = useBoardStore.getState().tasks
      expect(updatedTasks.find((t) => t.id === 'task-1')?.order).toBe(1)
      expect(updatedTasks.find((t) => t.id === 'task-2')?.order).toBe(2)
      expect(updatedTasks.find((t) => t.id === 'task-3')?.order).toBe(0)
    })
  })

  describe('addTaskOptimistic', () => {
    it('adds task to state', () => {
      useBoardStore.getState().addTaskOptimistic(mockTask)

      expect(useBoardStore.getState().tasks).toHaveLength(1)
      expect(useBoardStore.getState().tasks[0]).toEqual(mockTask)
    })
  })

  describe('updateTaskOptimistic', () => {
    it('updates existing task', () => {
      useBoardStore.getState().setBoard([], [mockTask])
      const updatedTask = { ...mockTask, title: 'Updated Title' }

      useBoardStore.getState().updateTaskOptimistic(updatedTask)

      expect(useBoardStore.getState().tasks[0].title).toBe('Updated Title')
    })
  })

  describe('deleteTaskOptimistic', () => {
    it('removes task from state', () => {
      useBoardStore.getState().setBoard([], [mockTask])

      useBoardStore.getState().deleteTaskOptimistic('task-1')

      expect(useBoardStore.getState().tasks).toHaveLength(0)
    })
  })
})
