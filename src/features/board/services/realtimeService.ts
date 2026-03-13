import { supabase } from '@/lib/supabase'

const DEFAULT_BOARD_ID = 'default-board'

export function subscribeToBoard(onChange: () => void) {
  const channel = supabase
    .channel(`board:${DEFAULT_BOARD_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      () => {
        onChange()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'columns',
      },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
