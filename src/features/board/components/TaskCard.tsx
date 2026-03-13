import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/shared/types'
import { cn } from '@/shared/lib/utils'
import { GripVertical, Pencil, Trash2, FileText } from 'lucide-react'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white rounded-lg border border-border/60 p-3.5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer',
        'opacity-0 animate-slide-up',
        isDragging || isSortableDragging ? 'opacity-50 shadow-card-drag ring-2 ring-terracotta/30 scale-[1.02]' : 'hover:border-border/80 hover:-translate-y-0.5'
      )}
      onClick={onEdit}
    >
      <div className="flex items-start gap-2.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-terracotta hover:scale-110"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
          {task.description && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70">
              <FileText className="w-3 h-3" />
              <span className="line-clamp-1">{task.description}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="p-1.5 hover:bg-red-50 rounded-md text-muted-foreground/50 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
