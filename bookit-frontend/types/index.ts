export interface User {
  id: string
  name: string
  email: string
  phone_number?: string
  role: 'customer' | 'staff' | 'admin'
  created_at?: string
}

export interface TableType {
  id: string
  name: string
}

export interface Table {
  id: string
  table_number: number
  table_type_id: string
  table_type_name: string
}

export interface Reservation {
  id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  description?: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
    phone_number?: string
  }
  table: {
    id: string
    table_number: number
    table_type_id: string
    table_type_name: string
  }
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

export type ReservationStatus = 'confirmed' | 'rejected' | 'completed' | 'cancelled'

export type StatusAction = 'confirm' | 'reject' | 'complete' | 'cancel'

export const STATUS_MAP: Record<StatusAction, ReservationStatus> = {
  confirm:  'confirmed',
  reject:   'rejected',
  complete: 'completed',
  cancel:   'cancelled'
}