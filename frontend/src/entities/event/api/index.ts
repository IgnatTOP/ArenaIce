import { api } from '../../../shared/api/client'

export interface Event {
  id: number
  title: string
  description: string
  event_type: string
  date: string
  image: string
  price_min: string
  price_max: string
  is_active: boolean
  seat_schema?: {
    id: number
    schema_data: any
    seats: Seat[]
  }
}

export interface Seat {
  id: number
  sector: string
  row: number
  number: number
  price: string
  status: 'available' | 'reserved' | 'sold'
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const eventApi = {
  getAll: () => api.get<PaginatedResponse<Event>>('/events/events/'),
  getById: (id: number) => api.get<Event>(`/events/events/${id}/`),
  getSeats: (id: number) => api.get<Seat[]>(`/events/events/${id}/seats/`),
}
