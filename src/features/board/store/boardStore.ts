import { create } from 'zustand'
import { Column, Task } from '@/shared/types'

interface BoardState {
  columns: Column[]
  tasks: Task[]
  setBoard: (columns: Column[], tasks: Task[]) => void
  moveTaskOptimistic: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newOrder: number
  ) => void
  reorderTasksOptimistic: (columnId: string, taskIds: string[]) => void
  addTaskOptimistic: (task: Task) => void
  updateTaskOptimistic: (task: Task) => void
  deleteTaskOptimistic: (taskId: string) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  tasks: [],

  setBoard: (columns, tasks) => set({ columns, tasks }),

  moveTaskOptimistic: (taskId, _sourceColumnId, destinationColumnId, newOrder) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, column_id: destinationColumnId, order: newOrder }
        }
        return task
      })
      return { tasks: updatedTasks }
    }),

  reorderTasksOptimistic: (columnId, taskIds) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.column_id === columnId) {
          const newOrder = taskIds.indexOf(task.id)
          if (newOrder !== -1) {
            return { ...task, order: newOrder }
          }
        }
        return task
      })
      return { tasks: updatedTasks }
    }),

  addTaskOptimistic: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTaskOptimistic: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  deleteTaskOptimistic: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
}))
