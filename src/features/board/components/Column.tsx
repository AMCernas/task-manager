import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from '@/shared/types'
import { TaskCard } from './TaskCard'
import { Plus, MoreHorizontal } from 'lucide-react'

interface ColumnProps {
  column: { id: string; title: string }
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  index: number
}

export function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask, index }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div 
      className="flex-shrink-0 w-80 bg-white/60 backdrop-blur-sm rounded-xl border border-border/40 flex flex-col max-h-full animate-fade-in opacity-0"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-foreground text-sm tracking-tight">{column.title}</h3>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-secondary/50 transition-colors text-muted-foreground/50 hover:text-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin transition-colors duration-200 ${
          isOver ? 'bg-terracotta/5' : ''
        }`}
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
          <div className="py-8 text-center text-sm text-muted-foreground/60">
            No tasks yet
          </div>
        )}
      </div>
      
      <button
        onClick={onAddTask}
        className="m-3 mt-0 p-2.5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-200 group"
      >
        <div className="w-5 h-5 rounded border border-dashed border-current flex items-center justify-center group-hover:border-transparent group-hover:bg-terracotta/10">
          <Plus className="w-3 h-3" />
        </div>
        <span className="font-medium">Add task</span>
      </button>
    </div>
  )
}
