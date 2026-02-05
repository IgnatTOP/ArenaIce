import { api } from '../../../shared/api/client'

export interface IceBooking {
  id: number
  date: string
  time_start: string
  time_end: string
  duration_hours: string
  name: string
  phone: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface AvailableSlot {
  date: string
  time_start: string
  time_end: string
}

export const bookingApi = {
  getAll: () => api.get<IceBooking[]>('/bookings/bookings/'),
  create: (data: Omit<IceBooking, 'id' | 'status' | 'created_at' | 'duration_hours'>) =>
    api.post('/bookings/bookings/', data),
  getAvailableSlots: (date: string) => api.get<AvailableSlot[]>(`/bookings/bookings/available_slots/?date=${date}`),
}
