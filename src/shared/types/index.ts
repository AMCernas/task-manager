export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface Column {
  id: string
  title: string
  order: number
  board_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  column_id: string
  order: number
  created_at: string
  updated_at: string
}

export interface Board {
  id: string
  title: string
  created_at: string
}

export interface User {
  id: string
  email: string
}
