import { useState, useRef, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from '@/shared/types'
import { TaskCard } from './TaskCard'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface ColumnProps {
  column: { id: string; title: string }
  tasks: Task[]
  isEditing: boolean
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onRenameColumn: (columnId: string, newTitle: string) => void
  onClearColumn: (columnId: string) => void
  onDeleteColumn: (columnId: string) => void
  onStartEditing: (columnId: string) => void
  onStopEditing: () => void
  index: number
}

export function Column({ column, tasks, isEditing, onAddTask, onEditTask, onDeleteTask, onRenameColumn, onClearColumn, onDeleteColumn, onStartEditing, onStopEditing, index }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditTitle(column.title)
  }, [column.title])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onRenameColumn(column.id, editTitle.trim())
    } else {
      setEditTitle(column.title)
    }
    onStopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditTitle(column.title)
      onStopEditing()
    }
  }

  const handleClear = () => {
    if (tasks.length > 0 && confirm(`Clear all ${tasks.length} tasks in "${column.title}"?`)) {
      onClearColumn(column.id)
    }
    setMenuOpen(false)
  }

  const handleDeleteColumn = () => {
    if (confirm(`Delete "${column.title}" and all its ${tasks.length} tasks?`)) {
      onDeleteColumn(column.id)
    }
    setMenuOpen(false)
  }

  const handleStartRename = () => {
    setMenuOpen(false)
    onStartEditing(column.id)
  }

  const columnLabel = `${column.title} column`
  const taskCountLabel = `${tasks.length} tasks in ${column.title}`

  return (
    <section 
      className="flex-shrink-0 w-80 bg-white/60 backdrop-blur-sm rounded-xl border border-border/40 flex flex-col max-h-full animate-fade-in opacity-0"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      role="region"
      aria-label={columnLabel}
    >
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm font-medium text-foreground bg-secondary px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-terracotta w-full"
            />
          ) : (
            <h3 className="font-medium text-foreground text-sm tracking-tight truncate">{column.title}</h3>
          )}
          <span 
            className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md flex-shrink-0"
            aria-label={taskCountLabel}
            aria-live="polite"
          >
            {tasks.length}
          </span>
        </div>
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1 rounded hover:bg-secondary/50 transition-colors text-muted-foreground/50 hover:text-foreground"
              aria-label={`Options for ${column.title}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] bg-white rounded-lg shadow-lg border border-border/60 p-1.5 z-50"
              sideOffset={5}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md cursor-pointer hover:bg-secondary/50 focus:outline-none focus:bg-secondary/50"
                onClick={handleStartRename}
              >
                <Pencil className="w-4 h-4" />
                Rename column
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md cursor-pointer hover:bg-red-50 focus:outline-none focus:bg-red-50"
                onClick={handleClear}
                disabled={tasks.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Clear tasks
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md cursor-pointer hover:bg-red-50 focus:outline-none focus:bg-red-50"
                onClick={handleDeleteColumn}
              >
                <Trash2 className="w-4 h-4" />
                Delete column
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin transition-colors duration-200 ${
          isOver ? 'bg-terracotta/5' : ''
        }`}
        role="list"
        aria-label={`Tasks in ${column.title}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div 
            className="py-8 text-center text-sm text-muted-foreground/60"
            role="status"
          >
            No tasks yet
          </div>
        )}
      </div>
      
      <button
        onClick={onAddTask}
        className="m-3 mt-0 p-2.5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200 group"
        aria-label={`Add task to ${column.title}`}
      >
        <div className="w-5 h-5 rounded border border-dashed border-current flex items-center justify-center group-hover:border-transparent group-hover:bg-terracotta/10">
          <Plus className="w-3 h-3" aria-hidden="true" />
        </div>
        <span className="font-medium">Add task</span>
      </button>
    </section>
  )
}
