import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { Button, Card, CardContent, Input, Label, Textarea, Modal, Tabs, StatCard, SearchBar, Badge } from '../../shared/ui'
import { useToastStore } from '@/shared/lib/toast'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Ticket, Snowflake, Plus, Edit, Trash2, TrendingUp, DollarSign, CheckCircle, Clock, Grid, Palette } from 'lucide-react'
import { EventSchemaCard } from '../../widgets/event-schema-card/ui'

export const AdminPage = () => {
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState<{ type: string; action: string; data?: any } | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { data: events } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => (await api.get('/events/events/')).data,
  })

  const { data: sections } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => (await api.get('/sections/sections/')).data,
  })

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users/')).data,
  })

  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => (await api.get('/bookings/bookings/')).data,
  })

  const { data: requests } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => (await api.get('/sections/requests/')).data,
  })

  const { data: tickets } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => (await api.get('/events/tickets/')).data,
    refetchInterval: 5000, // Обновление каждые 5 секунд
  })

  const { data: memberships } = useQuery({
    queryKey: ['admin-memberships'],
    queryFn: async () => (await api.get('/users/admin/memberships/')).data,
  })

  const { data: groups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: async () => (await api.get('/sections/groups/')).data,
  })

  const { data: schedules } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: async () => (await api.get('/sections/schedules/')).data,
  })

  const { data: seatSchemas } = useQuery({
    queryKey: ['admin-seat-schemas'],
    queryFn: async () => (await api.get('/events/seat-schemas/')).data,
  })

  const { data: timeSlots } = useQuery({
    queryKey: ['admin-timeslots'],
    queryFn: async () => (await api.get('/bookings/timeslots/')).data,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.type === 'membership') {
        return api.post('/users/admin/add-user-to-group/', data.payload)
      }
      if (data.type === 'group') {
        return api.post('/sections/groups/', data.payload)
      }
      if (data.type === 'schedule') {
        return api.post('/sections/schedules/', data.payload)
      }
      if (data.type === 'section') {
        return api.post('/sections/sections/', data.payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      if (data.type === 'timeslot') {
        return api.post('/bookings/timeslots/', data.payload)
      }
      return api.post(`/users/admin/create-${data.type}/`, data.payload)
    },
    onSuccess: () => {
      addToast('Создано успешно!', 'success')
      setShowModal(null)
      setFormData({})
      queryClient.invalidateQueries()
    },
    onError: () => addToast('Ошибка при создании', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/${data.endpoint}/${data.id}/`, data.payload),
    onSuccess: () => {
      addToast('Обновлено успешно!', 'success')
      setShowModal(null)
      setFormData({})
      queryClient.invalidateQueries()
    },
    onError: () => addToast('Ошибка при обновлении', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.endpoint === 'users/admin/memberships') {
        return api.delete(`/users/admin/remove-from-group/${data.id}/`)
      }
      if (data.endpoint === 'sections/groups') {
        return api.delete(`/sections/groups/${data.id}/`)
      }
      if (data.endpoint === 'sections/schedules') {
        return api.delete(`/sections/schedules/${data.id}/`)
      }
      return api.delete(`/${data.endpoint}/${data.id}/`)
    },
    onSuccess: () => {
      addToast('Удалено успешно!', 'success')
      queryClient.invalidateQueries()
    },
    onError: () => addToast('Ошибка при удалении', 'error'),
  })

  const allEvents = events?.results || events || []
  const allSections = sections?.results || sections || []
  const allUsers = users?.results || users || []
  const allBookings = Array.isArray(bookings?.results) ? bookings.results : (Array.isArray(bookings) ? bookings : [])
  const allRequests = requests?.results || requests || []
  const allTickets = tickets?.results || tickets || []
  const allMemberships = memberships || []
  const allGroups = groups?.results || groups || []
  const allSchedules = schedules?.results || schedules || []
  const allTimeSlots = Array.isArray(timeSlots?.results) ? timeSlots.results : (Array.isArray(timeSlots) ? timeSlots : [])

  const stats = useMemo(() => ({
    totalEvents: allEvents.length,
    totalUsers: allUsers.length,
    totalTickets: allTickets.length,
    totalRevenue: allTickets.reduce((sum: number, t: any) => sum + (Number(t.seat_info?.price) || 0), 0),
    pendingRequests: allRequests.filter((r: any) => r.status === 'pending').length,
    pendingBookings: allBookings.filter((b: any) => b.status === 'pending').length,
  }), [allEvents, allUsers, allTickets, allRequests, allBookings])

  const tabCategories = [
    {
      name: 'Главное',
      tabs: [
        { id: 'overview', label: 'Обзор', icon: TrendingUp },
      ]
    },
    {
      name: 'События',
      tabs: [
        { id: 'events', label: 'События', icon: Calendar, count: allEvents.length },
        { id: 'seats', label: 'Схемы зала', icon: Grid },
        { id: 'tickets', label: 'Билеты', icon: Ticket, count: allTickets.length },
      ]
    },
    {
      name: 'Секции',
      tabs: [
        { id: 'sections', label: 'Секции', icon: Snowflake, count: allSections.length },
        { id: 'schedule', label: 'Расписание', icon: Clock },
        { id: 'memberships', label: 'Членства', icon: Users, count: allMemberships.length },
      ]
    },
    {
      name: 'Управление',
      tabs: [
        { id: 'users', label: 'Пользователи', icon: Users, count: allUsers.length },
        { id: 'bookings', label: 'Аренда льда', icon: Calendar, count: allBookings.length },
        { id: 'timeslots', label: 'Слоты и цены', icon: Clock, count: allTimeSlots.length },
        { id: 'requests', label: 'Заявки', icon: Clock, count: allRequests.length },
      ]
    }
  ]

  const handleCreate = (type: string) => {
    setFormData({})
    setShowModal({ type, action: 'create' })
  }

  const handleEdit = (type: string, data: any) => {
    setFormData(data)
    setShowModal({ type, action: 'edit', data })
  }

  const handleDelete = (endpoint: string, id: number, name: string) => {
    if (confirm(`Удалить ${name}?`)) {
      deleteMutation.mutate({ endpoint, id })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление ледовой ареной</p>
        </motion.div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tabCategories.map((category) => (
              <Card key={category.name} className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 border-b">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                </div>
                <div className="p-3 space-y-1">
                  {category.tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            activeTab === tab.id 
                              ? 'bg-primary-foreground/20' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Всего событий" value={stats.totalEvents} icon={Calendar} color="blue" />
              <StatCard title="Пользователей" value={stats.totalUsers} icon={Users} color="green" />
              <StatCard title="Продано билетов" value={stats.totalTickets} icon={Ticket} color="purple" />
              <StatCard title="Выручка" value={`${stats.totalRevenue.toLocaleString('ru-RU')} ₽`} icon={DollarSign} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Ожидающие заявки</h3>
                    <Badge variant="warning">{stats.pendingRequests + stats.pendingBookings}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Заявки на секции</span>
                      <Badge variant="warning" size="sm">{stats.pendingRequests}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Заявки на аренду</span>
                      <Badge variant="warning" size="sm">{stats.pendingBookings}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Последние события</h3>
                  <div className="space-y-3">
                    {allEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('ru')}</p>
                        </div>
                        <Badge variant="info" size="sm">{event.event_type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <SearchBar placeholder="Поиск событий..." onSearch={setSearchQuery} />
              <Button onClick={() => handleCreate('event')}>
                <Plus className="w-4 h-4 mr-2" />
                Создать событие
              </Button>
            </div>
            <div className="grid gap-4">
              {allEvents
                .filter((e: any) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((event: any) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <Badge variant="info" size="sm">{event.event_type}</Badge>
                          <Badge variant={event.is_active ? "success" : "error"} size="sm">
                            {event.is_active ? "Активно" : "Неактивно"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(event.date).toLocaleString('ru')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>{event.price_min}₽ - {event.price_max}₽</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit('event', event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('events/events', event.id, event.title)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'seats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Схемы зала</h2>
              <p className="text-muted-foreground mb-6">Создайте схему мест для каждого события</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {allEvents.map((event: any) => {
                const schema = (seatSchemas?.results || seatSchemas || []).find((s: any) => s.event === event.id)
                
                return (
                  <EventSchemaCard 
                    key={event.id} 
                    event={event} 
                    schema={schema}
                  />
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <SearchBar placeholder="Поиск секций..." onSearch={setSearchQuery} />
              <Button onClick={() => handleCreate('section')}>
                <Plus className="w-4 h-4 mr-2" />
                Создать секцию
              </Button>
            </div>
            <div className="grid gap-4">
              {allSections
                .filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((section: any) => (
                <Card key={section.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{section.name}</h3>
                          <Badge variant="success" size="sm">{section.section_type}</Badge>
                          <Badge variant={section.is_active ? "success" : "error"} size="sm">
                            {section.is_active ? "Активна" : "Неактивна"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>{section.price}₽/мес</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{section.groups?.length || 0} групп</span>
                          </div>
                        </div>
                        {section.groups && section.groups.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {section.groups.map((group: any) => (
                              <Badge key={group.id} variant="info" size="sm">{group.name}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit('section', section)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('sections/sections', section.id, section.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Управление группами и расписанием</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCreate('group')} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить группу
                    </Button>
                    <Button onClick={() => handleCreate('schedule')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить расписание
                    </Button>
                  </div>
                </div>
                
                {allSections.length > 0 ? (
                  <div className="space-y-6">
                    {allSections.map((section: any) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <h4 className="font-bold text-lg mb-4">{section.name}</h4>
                        
                        {section.groups && section.groups.length > 0 ? (
                          <div className="space-y-4">
                            {section.groups.map((group: any) => (
                              <div key={group.id} className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium text-lg">{group.name}</h5>
                                    <Badge variant="info" size="sm">
                                      {group.members_count || 0}/{group.max_members} чел.
                                    </Badge>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleDelete('sections/groups', group.id, group.name)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {group.schedules && group.schedules.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {group.schedules.map((schedule: any) => (
                                      <div key={schedule.id} className="bg-background p-3 rounded-lg flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-sm">{schedule.day_name}</div>
                                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {schedule.time_start} - {schedule.time_end}
                                          </div>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          onClick={() => handleDelete('sections/schedules', schedule.id, `${schedule.day_name}`)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Нет расписания для этой группы</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Нет групп в этой секции</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Нет секций</h3>
                    <p className="text-sm text-muted-foreground mb-4">Создайте секции для начала работы</p>
                    <Button onClick={() => setActiveTab('sections')}>Перейти к секциям</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <SearchBar placeholder="Поиск пользователей..." onSearch={setSearchQuery} />
            </div>
            <div className="grid gap-4">
              {allUsers
                .filter((u: any) => 
                  u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user: any) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{user.username}</h3>
                            {user.is_staff && <Badge variant="error" size="sm">Админ</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {(user.first_name || user.last_name) && (
                            <p className="text-sm">{user.first_name} {user.last_name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <SearchBar placeholder="Поиск билетов..." onSearch={setSearchQuery} />
            </div>
            <div className="grid gap-4">
              {allTickets
                .filter((t: any) => 
                  t.event_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ticket: any) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Ticket className="w-5 h-5 text-primary" />
                          <h3 className="font-bold">{ticket.event_title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.user_email}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="bg-muted px-2 py-1 rounded">Сектор {ticket.seat_info.sector}</span>
                          <span className="bg-muted px-2 py-1 rounded">Ряд {ticket.seat_info.row}</span>
                          <span className="bg-muted px-2 py-1 rounded">Место {ticket.seat_info.number}</span>
                          <span className="font-bold text-primary">{ticket.seat_info.price}₽</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => {
                            updateMutation.mutate({
                              endpoint: 'events/tickets',
                              id: ticket.id,
                              payload: { status: e.target.value }
                            })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                            ticket.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                            ticket.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          <option value="pending">Ожидает оплаты</option>
                          <option value="paid">Оплачен</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('events/tickets', ticket.id, `Билет #${ticket.id}`)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <SearchBar placeholder="Поиск заявок на аренду..." onSearch={setSearchQuery} />
            </div>
            <div className="grid gap-4">
              {allBookings
                .filter((b: any) => 
                  b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.phone?.includes(searchQuery)
                )
                .map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{booking.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{booking.phone}</p>
                        <div className="flex flex-wrap gap-3 text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.time_start} - {booking.time_end}</span>
                          </div>
                          <Badge variant="info" size="sm">{booking.duration_hours}ч</Badge>
                        </div>
                        {booking.message && (
                          <p className="text-sm bg-muted/50 p-2 rounded">{booking.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => {
                            updateMutation.mutate({
                              endpoint: 'bookings/bookings',
                              id: booking.id,
                              payload: { status: e.target.value }
                            })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                            booking.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="approved">Одобрено</option>
                          <option value="rejected">Отклонено</option>
                        </select>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('bookings', booking.id, booking.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <SearchBar placeholder="Поиск заявок на секции..." onSearch={setSearchQuery} />
            </div>
            <div className="grid gap-4">
              {allRequests
                .filter((r: any) => 
                  r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.phone?.includes(searchQuery)
                )
                .map((request: any) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{request.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{request.phone}</p>
                        {request.message && (
                          <p className="text-sm bg-muted/50 p-2 rounded">{request.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={request.status}
                          onChange={(e) => {
                            updateMutation.mutate({
                              endpoint: 'sections/requests',
                              id: request.id,
                              payload: { status: e.target.value }
                            })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                            request.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                            request.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="approved">Одобрено</option>
                          <option value="rejected">Отклонено</option>
                        </select>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('sections/requests', request.id, request.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'memberships' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <SearchBar placeholder="Поиск членств..." onSearch={setSearchQuery} />
              <Button onClick={() => handleCreate('membership')}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить в группу
              </Button>
            </div>
            <div className="grid gap-4">
              {allMemberships.length > 0 ? (
                allMemberships
                  .filter((m: any) => 
                    m.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((membership: any) => (
                  <Card key={membership.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">{membership.user_email}</h3>
                            <p className="text-sm text-muted-foreground">{membership.group_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Присоединился: {new Date(membership.joined_at).toLocaleDateString('ru')}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('users/admin/memberships', membership.id, membership.user_email)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Нет членств в группах</h3>
                  <p className="text-sm text-muted-foreground mb-4">Добавьте пользователей в группы для начала работы</p>
                  <Button onClick={() => handleCreate('membership')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить первое членство
                  </Button>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'timeslots_duplicate_remove' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <SearchBar placeholder="Поиск бронирований..." onSearch={setSearchQuery} />
            </div>
            <div className="grid gap-4">
              {allBookings
                .filter((b: any) => 
                  b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.phone?.includes(searchQuery)
                )
                .map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{booking.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{booking.phone}</p>
                        <p className="text-sm mb-2">
                          <strong>Дата:</strong> {new Date(booking.date).toLocaleDateString('ru')} | 
                          <strong> Время:</strong> {booking.time_start} - {booking.time_end} ({booking.duration_hours}ч)
                        </p>
                        {booking.message && (
                          <p className="text-sm bg-muted/50 p-2 rounded">{booking.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => {
                            updateMutation.mutate({
                              endpoint: 'bookings/bookings',
                              id: booking.id,
                              payload: { status: e.target.value }
                            })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                            booking.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="approved">Одобрено</option>
                          <option value="rejected">Отклонено</option>
                        </select>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('bookings/bookings', booking.id, booking.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'timeslots' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Временные слоты и цены</h2>
              <Button onClick={() => {
                setFormData({ time_start: '08:00', time_end: '09:00', price: 4000, is_active: true })
                setShowModal({ type: 'timeslot', action: 'create' })
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Создать слот
              </Button>
            </div>
            <div className="grid gap-4">
              {allTimeSlots.map((slot: any) => (
                <Card key={slot.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{slot.day_of_week_display}</p>
                          <h3 className="font-bold mb-1">{slot.time_start} - {slot.time_end}</h3>
                          <p className="text-2xl font-bold text-primary">{slot.price}₽</p>
                          <p className={`text-xs mt-1 ${slot.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {slot.is_active ? 'Активен' : 'Неактивен'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setFormData(slot)
                          setShowModal({ type: 'timeslot', action: 'edit' })
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('bookings/timeslots', slot.id, `${slot.time_start}-${slot.time_end}`)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Модальные окна */}
        <Modal
          isOpen={showModal?.type === 'event'}
          onClose={() => setShowModal(null)}
          title={showModal?.action === 'edit' ? 'Редактировать событие' : 'Создать событие'}
        >
          <form onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData()
            
            // Добавляем только нужные поля
            const fieldsToSend = ['title', 'description', 'event_type', 'date', 'price_min', 'price_max']
            fieldsToSend.forEach(key => {
              if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                form.append(key, formData[key])
              }
            })
            
            // Добавляем изображение только если оно выбрано
            if (formData.image && formData.image instanceof File) {
              form.append('image', formData.image)
            }
            
            // Добавляем is_active как строку
            form.append('is_active', formData.is_active !== false ? 'true' : 'false')
            
            if (showModal?.action === 'edit') {
              try {
                await api.patch(`/events/events/${formData.id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
                addToast('Обновлено!', 'success')
                setShowModal(null)
                setFormData({})
                queryClient.invalidateQueries()
              } catch (e: any) {
                const errorMsg = e.response?.data?.detail || JSON.stringify(e.response?.data) || e.message
                addToast('Ошибка: ' + errorMsg, 'error')
              }
            } else {
              try {
                await api.post('/events/events/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
                addToast('Создано!', 'success')
                setShowModal(null)
                setFormData({})
                queryClient.invalidateQueries()
              } catch (e: any) {
                const errorMsg = e.response?.data?.detail || JSON.stringify(e.response?.data) || e.message
                addToast('Ошибка: ' + errorMsg, 'error')
              }
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Изображение {showModal?.action === 'edit' && '(оставьте пустым, чтобы не менять)'}</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFormData({...formData, image: e.target.files?.[0]})} 
                required={showModal?.action !== 'edit'} 
              />
              {showModal?.action === 'edit' && formData.image && typeof formData.image === 'string' && (
                <p className="text-xs text-muted-foreground">Текущее изображение: {formData.image.split('/').pop()}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип</Label>
                <select value={formData.event_type || ''} onChange={(e) => setFormData({...formData, event_type: e.target.value})} className="w-full p-2 border rounded-lg" required>
                  <option value="">Выберите</option>
                  <option value="hockey">Хоккей</option>
                  <option value="figure_skating">Фигурное катание</option>
                  <option value="show">Шоу</option>
                  <option value="competition">Соревнование</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Дата и время</Label>
                <Input type="datetime-local" value={formData.date?.slice(0, 16) || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Цена от</Label>
                <Input type="number" value={formData.price_min || ''} onChange={(e) => setFormData({...formData, price_min: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Цена до</Label>
                <Input type="number" value={formData.price_max || ''} onChange={(e) => setFormData({...formData, price_max: e.target.value})} required />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="event_active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="event_active" className="cursor-pointer">Активно (видно пользователям)</Label>
            </div>
            <Button type="submit" className="w-full">
              {showModal?.action === 'edit' ? 'Обновить' : 'Создать'}
            </Button>
          </form>
        </Modal>

        <Modal
          isOpen={showModal?.type === 'section'}
          onClose={() => setShowModal(null)}
          title={showModal?.action === 'edit' ? 'Редактировать секцию' : 'Создать секцию'}
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('section_type', formData.section_type)
            formDataToSend.append('price', formData.price)
            formDataToSend.append('is_active', formData.is_active ? 'true' : 'false')
            if (formData.image && formData.image instanceof File) {
              formDataToSend.append('image', formData.image)
            }
            
            if (showModal?.action === 'edit') {
              updateMutation.mutate({ endpoint: 'sections/sections', id: formData.id, payload: formDataToSend })
            } else {
              createMutation.mutate({ type: 'section', payload: formDataToSend })
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Тип</Label>
              <select value={formData.section_type || ''} onChange={(e) => setFormData({...formData, section_type: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите</option>
                <option value="hockey">Хоккей</option>
                <option value="figure_skating">Фигурное катание</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Изображение</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files?.[0]})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Цена (₽/мес)</Label>
              <Input type="number" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Активна</Label>
            </div>
            <Button type="submit" className="w-full">
              {showModal?.action === 'edit' ? 'Обновить' : 'Создать'}
            </Button>
          </form>
        </Modal>

        <Modal
          isOpen={showModal?.type === 'timeslot'}
          onClose={() => setShowModal(null)}
          title={showModal?.action === 'edit' ? 'Редактировать слот' : 'Создать слот'}
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            if (showModal?.action === 'edit') {
              updateMutation.mutate({ endpoint: 'bookings/timeslots', id: formData.id, payload: formData })
            } else {
              createMutation.mutate({ type: 'timeslot', payload: formData })
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>День недели</Label>
              <select 
                value={formData.day_of_week ?? ''} 
                onChange={(e) => setFormData({...formData, day_of_week: e.target.value === '' ? null : parseInt(e.target.value)})} 
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Все дни</option>
                <option value="0">Понедельник</option>
                <option value="1">Вторник</option>
                <option value="2">Среда</option>
                <option value="3">Четверг</option>
                <option value="4">Пятница</option>
                <option value="5">Суббота</option>
                <option value="6">Воскресенье</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Время начала</Label>
              <Input type="time" value={formData.time_start || ''} onChange={(e) => setFormData({...formData, time_start: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Время окончания</Label>
              <Input type="time" value={formData.time_end || ''} onChange={(e) => setFormData({...formData, time_end: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input type="number" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="timeslot_active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="timeslot_active" className="cursor-pointer">Активен</Label>
            </div>
            <Button type="submit" className="w-full">
              {showModal?.action === 'edit' ? 'Обновить' : 'Создать'}
            </Button>
          </form>
        </Modal>

        <Modal
          isOpen={showModal?.type === 'membership'}
          onClose={() => setShowModal(null)}
          title="Добавить пользователя в группу"
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate({ type: 'membership', payload: { user_id: formData.user_id, group_id: formData.group_id } })
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Пользователь</Label>
              <select value={formData.user_id || ''} onChange={(e) => setFormData({...formData, user_id: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите пользователя</option>
                {allUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.email} ({user.username})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Группа</Label>
              <select value={formData.group_id || ''} onChange={(e) => setFormData({...formData, group_id: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите группу</option>
                {allSections.flatMap((section: any) => 
                  section.groups?.map((group: any) => (
                    <option key={group.id} value={group.id}>{section.name} - {group.name}</option>
                  ))
                )}
              </select>
            </div>
            <Button type="submit" className="w-full">Добавить</Button>
          </form>
        </Modal>

        <Modal
          isOpen={showModal?.type === 'group'}
          onClose={() => setShowModal(null)}
          title="Создать группу"
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate({ type: 'group', payload: formData })
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Секция</Label>
              <select value={formData.section || ''} onChange={(e) => setFormData({...formData, section: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите секцию</option>
                {allSections.map((section: any) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Название группы</Label>
              <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Например: Группа А" required />
            </div>
            <div className="space-y-2">
              <Label>Максимум участников</Label>
              <Input type="number" value={formData.max_members || 20} onChange={(e) => setFormData({...formData, max_members: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full">Создать</Button>
          </form>
        </Modal>

        <Modal
          isOpen={showModal?.type === 'schedule'}
          onClose={() => setShowModal(null)}
          title="Добавить расписание"
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate({ type: 'schedule', payload: formData })
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Группа</Label>
              <select value={formData.group || ''} onChange={(e) => setFormData({...formData, group: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите группу</option>
                {allSections.flatMap((section: any) => 
                  section.groups?.map((group: any) => (
                    <option key={group.id} value={group.id}>{section.name} - {group.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label>День недели</Label>
              <select value={formData.day_of_week ?? ''} onChange={(e) => setFormData({...formData, day_of_week: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите день</option>
                <option value="0">Понедельник</option>
                <option value="1">Вторник</option>
                <option value="2">Среда</option>
                <option value="3">Четверг</option>
                <option value="4">Пятница</option>
                <option value="5">Суббота</option>
                <option value="6">Воскресенье</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Время начала</Label>
                <Input type="time" value={formData.time_start || ''} onChange={(e) => setFormData({...formData, time_start: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Время окончания</Label>
                <Input type="time" value={formData.time_end || ''} onChange={(e) => setFormData({...formData, time_end: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full">Добавить</Button>
          </form>
        </Modal>

        {/* Модальное окно добавления места */}
        <Modal
          isOpen={showModal?.type === 'add-seat'}
          onClose={() => setShowModal(null)}
          title="Добавить место"
        >
          <form onSubmit={async (e) => {
            e.preventDefault()
            try {
              await api.post('/events/seats/', {
                schema: showModal?.data?.schema_id,
                sector: formData.sector,
                row: parseInt(formData.row),
                number: parseInt(formData.number),
                price: parseFloat(formData.price),
                status: 'available'
              })
              addToast('Место добавлено!', 'success')
              setShowModal(null)
              setFormData({})
              queryClient.invalidateQueries()
            } catch (e: any) {
              addToast(e.response?.data?.detail || 'Ошибка при добавлении', 'error')
            }
          }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Сектор</Label>
                <Input 
                  value={formData.sector || ''} 
                  onChange={(e) => setFormData({...formData, sector: e.target.value.toUpperCase()})} 
                  placeholder="A, B, C..."
                  maxLength={2}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Ряд</Label>
                <Input 
                  type="number" 
                  value={formData.row || ''} 
                  onChange={(e) => setFormData({...formData, row: e.target.value})} 
                  placeholder="1, 2, 3..."
                  min="1"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Место</Label>
                <Input 
                  type="number" 
                  value={formData.number || ''} 
                  onChange={(e) => setFormData({...formData, number: e.target.value})} 
                  placeholder="1, 2, 3..."
                  min="1"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input 
                type="number" 
                value={formData.price || ''} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                placeholder={`${showModal?.data?.event?.price_min} - ${showModal?.data?.event?.price_max}`}
                min="0"
                step="0.01"
                required 
              />
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(null)} className="flex-1">
                Отмена
              </Button>
              <Button type="submit" className="flex-1">
                Добавить место
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
