import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useBoardStore } from '../store/boardStore'
import { getBoard, moveTask, createTask, updateTask, deleteTask, updateColumn, deleteTasksInColumn, createColumn, deleteColumn } from '../services/taskService'
import { subscribeToBoard } from '../services/realtimeService'
import { Column } from '../components/Column'
import { TaskCard } from '../components/TaskCard'
import { Task } from '@/shared/types'
import { TaskModal } from '@/features/task/components/TaskModal'

export function BoardPage() {
  const queryClient = useQueryClient()
  const { columns, tasks, setBoard, moveTaskOptimistic, reorderTasksOptimistic } = useBoardStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  const { data: boardData, isLoading } = useQuery({
    queryKey: ['board'],
    queryFn: getBoard,
  })

  useEffect(() => {
    if (boardData) {
      setBoard(boardData.columns, boardData.tasks)
    }
  }, [boardData, setBoard])

  useEffect(() => {
    const unsubscribe = subscribeToBoard(() => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    })

    return () => unsubscribe()
  }, [queryClient])

  const createTaskMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      createTask(columnId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      setNewTaskColumnId(null)
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: { title?: string; description?: string } }) =>
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      setEditingTask(null)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, updates }: { columnId: string; updates: { title: string } }) =>
      updateColumn(columnId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const clearColumnMutation = useMutation({
    mutationFn: deleteTasksInColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const createColumnMutation = useMutation({
    mutationFn: createColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findTaskById = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks]
  )

  const findColumnByTaskId = useCallback(
    (taskId: string) => {
      const task = findTaskById(taskId)
      return columns.find((c) => c.id === task?.column_id)
    },
    [columns, findTaskById]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = findTaskById(active.id as string)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    const overColumn = columns.find((c) => c.id === overId)

    if (!activeColumn || !overColumn) return
    if (activeColumn.id === overColumn.id) return

    const overTasks = tasks
      .filter((t) => t.column_id === overColumn.id)
      .sort((a, b) => a.order - b.order)

    const overIndex = overTasks.findIndex((t) => t.id === overId)
    const newOrder = overIndex >= 0 ? overIndex : overTasks.length

    moveTaskOptimistic(activeId, activeColumn.id, overColumn.id, newOrder)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumnByTaskId(activeId)
    const overColumn = columns.find((c) => c.id === overId) || findColumnByTaskId(overId)

    if (!activeColumn || !overColumn) return

    const columnTasks = tasks
      .filter((t) => t.column_id === overColumn.id)
      .sort((a, b) => a.order - b.order)

    const activeIndex = columnTasks.findIndex((t) => t.id === activeId)
    const overIndex = columnTasks.findIndex((t) => t.id === overId)

    if (activeIndex !== overIndex && activeIndex >= 0) {
      const newOrder = overIndex >= 0 ? overIndex : columnTasks.length - 1
      const reordered = arrayMove(columnTasks, activeIndex, newOrder)

      reorderTasksOptimistic(
        overColumn.id,
        reordered.map((t) => t.id)
      )

      try {
        await moveTask(activeId, overColumn.id, newOrder)
      } catch (error) {
        console.error('Failed to move task:', error)
        queryClient.invalidateQueries({ queryKey: ['board'] })
      }
    }
  }

  const handleAddTask = (columnId: string) => {
    setNewTaskColumnId(columnId)
  }

  const handleCreateTask = (data: { title?: string; description?: string }) => {
    if (newTaskColumnId && data.title) {
      createTaskMutation.mutate({ columnId: newTaskColumnId, title: data.title })
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = (updates: { title?: string; description?: string }) => {
    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, updates })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId)
    setEditingTask(null)
  }

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    updateColumnMutation.mutate({ columnId, updates: { title: newTitle } })
    setEditingColumnId(null)
  }

  const handleClearColumn = (columnId: string) => {
    clearColumnMutation.mutate(columnId)
  }

  const handleAddColumn = () => {
    createColumnMutation.mutate()
  }

  const handleDeleteColumn = (columnId: string) => {
    deleteColumnMutation.mutate(columnId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="animate-pulse text-muted-foreground">Loading board...</div>
        <span className="sr-only">Loading board</span>
      </div>
    )
  }

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div 
        className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-thin"
        role="application"
        aria-label="Task board"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {sortedColumns.map((column, index) => (
            <Column
              key={column.id}
              column={column}
              index={index}
              isEditing={editingColumnId === column.id}
              tasks={tasks
                .filter((t) => t.column_id === column.id)
                .sort((a, b) => a.order - b.order)}
              onAddTask={() => handleAddTask(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onRenameColumn={handleRenameColumn}
              onClearColumn={handleClearColumn}
              onDeleteColumn={handleDeleteColumn}
              onStartEditing={(id) => setEditingColumnId(id)}
              onStopEditing={() => setEditingColumnId(null)}
            />
          ))}
          
          <button
            onClick={handleAddColumn}
            className="flex-shrink-0 w-80 p-3 border-2 border-dashed border-border/40 rounded-xl text-muted-foreground hover:text-foreground hover:border-terracotta/50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
            aria-label="Add new column"
          >
            + Add Column
          </button>
          
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {newTaskColumnId && (
        <TaskModal
          mode="create"
          onSave={handleCreateTask}
          onClose={() => setNewTaskColumnId(null)}
        />
      )}

      {editingTask && (
        <TaskModal
          mode="edit"
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={() => handleDeleteTask(editingTask.id)}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
