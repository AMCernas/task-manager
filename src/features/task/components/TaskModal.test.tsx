import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from './TaskModal'

const renderComponent = (props = {}) => {
  const defaultProps = {
    mode: 'create' as const,
    onSave: vi.fn(),
    onClose: vi.fn(),
  }
  return render(<TaskModal {...defaultProps} {...props} />)
}

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    it('renders create mode correctly', () => {
      renderComponent()

      expect(screen.getByText('New Task')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
    })

    it('renders edit mode correctly', () => {
      const task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        column_id: 'col-1',
        order: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      renderComponent({ mode: 'edit', task })

      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    })

    it('renders delete button in edit mode', () => {
      const task = {
        id: 'task-1',
        title: 'Test Task',
        description: null,
        column_id: 'col-1',
        order: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      renderComponent({ mode: 'edit', task, onDelete: vi.fn() })

      expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('shows error when title is empty', async () => {
      const user = userEvent.setup()
      renderComponent()

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })

    it('shows error when title is too long', async () => {
      const user = userEvent.setup()
      renderComponent()

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'a'.repeat(201))

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title is too long')).toBeInTheDocument()
      })
    })
  })

  describe('user interactions', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderComponent({ onClose })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderComponent({ onClose })

      const closeButton = screen.getByRole('button', { name: /close dialog/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      const task = {
        id: 'task-1',
        title: 'Test Task',
        description: null,
        column_id: 'col-1',
        order: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      renderComponent({ mode: 'edit', task, onDelete })

      const deleteButton = screen.getByRole('button', { name: /delete task/i })
      await user.click(deleteButton)

      expect(onDelete).toHaveBeenCalled()
    })
  })

  describe('keyboard interactions', () => {
    it('calls onClose when Escape is pressed', async () => {
      const onClose = vi.fn()
      renderComponent({ onClose })

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('submits form when Enter is pressed in title field', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      renderComponent({ onSave })

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Task{Enter}')

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({ title: 'New Task', description: '' })
      })
    })
  })
})
