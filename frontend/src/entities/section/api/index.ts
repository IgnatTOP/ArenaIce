import { api } from '../../../shared/api/client'

export interface Section {
  id: number
  name: string
  section_type: 'hockey' | 'figure_skating'
  description: string
  image: string
  price: string
  is_active: boolean
  groups: Group[]
}

export interface Group {
  id: number
  name: string
  max_members: number
  members_count: number
  schedules: Schedule[]
}

export interface Schedule {
  id: number
  day_of_week: number
  day_name: string
  time_start: string
  time_end: string
}

export const sectionApi = {
  getAll: () => api.get<Section[]>('/sections/sections/'),
  getById: (id: number) => api.get<Section>(`/sections/sections/${id}/`),
  getMySchedule: () => api.get<Schedule[]>('/sections/schedules/'),
  createRequest: (data: { section: number; name: string; phone: string; message?: string }) =>
    api.post('/sections/requests/', data),
}
