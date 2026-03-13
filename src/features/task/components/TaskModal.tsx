import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@/shared/types'
import { cn } from '@/shared/lib/utils'
import { X, Trash2 } from 'lucide-react'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskModalProps {
  mode: 'create' | 'edit'
  task?: Task
  onSave: (data: { title?: string; description?: string }) => void
  onDelete?: () => void
  onClose: () => void
}

export function TaskModal({ mode, task, onSave, onDelete, onClose }: TaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
    },
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const onSubmit = (data: TaskFormData) => {
    onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            {mode === 'create' ? 'New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              {...register('title')}
              id="title"
              autoFocus
              className={cn(
                'input-field text-base',
                errors.title ? 'border-destructive focus:ring-destructive/30' : ''
              )}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={5}
              className={cn(
                'input-field text-sm resize-none leading-relaxed',
                errors.description ? 'border-destructive focus:ring-destructive/30' : ''
              )}
              placeholder="Add more details..."
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete task
              </button>
            )}
            <div className="flex gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create task' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
