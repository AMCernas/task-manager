import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  column_id: 'col-1',
  order: 0,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const renderComponent = (props = {}) => {
  const defaultProps = {
    task: mockTask,
  }
  return render(<TaskCard {...defaultProps} {...props} />)
}

describe('TaskCard', () => {
  describe('render', () => {
    it('renders task title', () => {
      renderComponent()

      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    it('renders task description when present', () => {
      renderComponent()

      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('renders without description', () => {
      renderComponent({ task: { ...mockTask, description: null } })

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })

    it('has proper accessibility attributes on article', () => {
      renderComponent()

      const article = screen.getByRole('button', { name: /Task: Test Task/i })
      expect(article).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('calls onEdit when article is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      renderComponent({ onEdit })

      const article = screen.getByRole('button', { name: /Task: Test Task/i })
      await user.click(article)

      expect(onEdit).toHaveBeenCalled()
    })

    it('calls onEdit when Enter key is pressed on article', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      renderComponent({ onEdit })

      const article = screen.getByRole('button', { name: /Task: Test Task/i })
      await user.click(article)
      await user.keyboard('{Enter}')

      expect(onEdit).toHaveBeenCalled()
    })
  })

  describe('dragging state', () => {
    it('applies dragging styles when isDragging is true', () => {
      const { container } = renderComponent({ isDragging: true })

      const article = container.firstChild as HTMLElement
      expect(article.className).toContain('opacity-50')
    })
  })
})
