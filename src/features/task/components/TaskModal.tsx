import { useEffect, useRef, useCallback } from 'react'
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

function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return containerRef
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

  const dialogRef = useFocusTrap(true)

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const onSubmit = (data: TaskFormData) => {
    onSave(data)
  }

  const titleId = `task-modal-title-${mode}`
  const descriptionErrorId = 'description-error'
  const titleErrorId = 'title-error'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      <div 
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-modal w-full max-w-lg animate-scale-in"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 
            id={titleId} 
            className="text-lg font-semibold text-foreground tracking-tight"
          >
            {mode === 'create' ? 'New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5" noValidate>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              {...register('title')}
              id="title"
              autoFocus
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? titleErrorId : undefined}
              className={cn(
                'input-field text-base',
                errors.title ? 'border-destructive focus:ring-destructive/30' : ''
              )}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p id={titleErrorId} className="mt-1.5 text-xs text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? descriptionErrorId : undefined}
              rows={5}
              className={cn(
                'input-field text-sm resize-none leading-relaxed',
                errors.description ? 'border-destructive focus:ring-destructive/30' : ''
              )}
              placeholder="Add more details..."
            />
            {errors.description && (
              <p id={descriptionErrorId} className="mt-1.5 text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
                aria-label={`Delete task "${task?.title}"`}
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
