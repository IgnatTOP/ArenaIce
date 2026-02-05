import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { sectionApi } from '../../entities/section/api'
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Button, Input, Label, Modal, Badge, Tabs, NameInput, EmailInput } from '../../shared/ui'
import { useAuthStore } from '../../entities/user/model/store'
import { motion } from 'framer-motion'
import { Calendar, Clock, Ticket, Users, Edit, Mail, User as UserIcon, Phone, MapPin, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '@/shared/lib/toast'
import { validators, validateForm } from '@/shared/lib/validators'

export const ProfilePage = () => {
  const { user, setUser, isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/')
      setUser(data)
      setEditData(data)
      return data
    },
    enabled: isAuthenticated,
  })

  const { data: schedule } = useQuery({
    queryKey: ['my-schedule'],
    queryFn: async () => {
      const res = await api.get('/sections/schedules/')
      return res.data.results || res.data || []
    },
    enabled: isAuthenticated && !!user,
  })

  const { data: tickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get('/events/tickets/')
      return response.data
    },
    enabled: isAuthenticated,
  })

  const ticketsList = tickets?.results || tickets || []

  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/bookings/')
      return response.data
    },
    enabled: isAuthenticated,
  })

  const { data: myRequests } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const response = await api.get('/sections/requests/')
      return response.data
    },
    enabled: isAuthenticated,
  })

  const bookingsList = myBookings?.results || myBookings || []
  const requestsList = myRequests?.results || myRequests || []

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/me/', data),
    onSuccess: (response) => {
      setUser(response.data)
      setIsEditMode(false)
      addToast('Профиль обновлён', 'success')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => addToast('Ошибка обновления профиля', 'error'),
  })

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: UserIcon },
    { id: 'schedule', label: 'Расписание', icon: Calendar, count: schedule?.length || 0 },
    { id: 'tickets', label: 'Билеты', icon: Ticket, count: ticketsList.length },
    { id: 'bookings', label: 'Аренда', icon: Clock, count: bookingsList.length },
    { id: 'requests', label: 'Заявки', icon: Users, count: requestsList.length },
  ]

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64" />
      </div>
    )
  }

  const handleSaveProfile = () => {
    const validationErrors = validateForm(editData, {
      first_name: [validators.name],
      last_name: [validators.name],
      email: [validators.required, validators.email],
    })
    
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    
    updateProfileMutation.mutate({
      first_name: editData.first_name,
      last_name: editData.last_name,
      email: editData.email,
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управление вашим профилем и активностью</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
          </div>
        </motion.div>

        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <UserIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
                    <p className="text-muted-foreground mb-4">{user.email}</p>
                    {user.is_staff && (
                      <Badge variant="error">Администратор</Badge>
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    {user.first_name && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{user.first_name} {user.last_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Мои группы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.groups_info?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.groups_info.map((group) => (
                        <div key={group.group_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <h3 className="font-bold mb-1">{group.group_name}</h3>
                          <p className="text-sm text-muted-foreground">{group.section}</p>
                          <Badge variant="success" size="sm" className="mt-2">Активна</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Вы не записаны ни в одну группу</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/sections')}>
                        Выбрать секцию
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Ticket className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold mb-1">{ticketsList.length}</p>
                  <p className="text-sm text-muted-foreground">Билетов</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-3xl font-bold mb-1">{bookingsList.length}</p>
                  <p className="text-sm text-muted-foreground">Заявок на аренду</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-3xl font-bold mb-1">{requestsList.length}</p>
                  <p className="text-sm text-muted-foreground">Заявок на секции</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Расписание занятий
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedule && schedule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedule.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{item.day_name || (
                            item.day_of_week === 0 ? 'Понедельник' : 
                            item.day_of_week === 1 ? 'Вторник' :
                            item.day_of_week === 2 ? 'Среда' :
                            item.day_of_week === 3 ? 'Четверг' :
                            item.day_of_week === 4 ? 'Пятница' :
                            item.day_of_week === 5 ? 'Суббота' : 'Воскресенье'
                          )}</h3>
                          <Badge variant="info" size="sm">{item.group_name}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{item.time_start} - {item.time_end}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Нет расписания</h3>
                    <p className="text-sm text-muted-foreground">Запишитесь в группу, чтобы увидеть расписание</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Мои билеты
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsList && ticketsList.length > 0 ? (
                  <div className="space-y-4">
                    {ticketsList.map((ticket: any) => (
                      <div key={ticket.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold mb-2">{ticket.event_title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="bg-muted px-2 py-1 rounded text-sm">Сектор {ticket.seat_info.sector}</span>
                              <span className="bg-muted px-2 py-1 rounded text-sm">Ряд {ticket.seat_info.row}</span>
                              <span className="bg-muted px-2 py-1 rounded text-sm">Место {ticket.seat_info.number}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl text-primary mb-2">{ticket.seat_info.price}₽</p>
                            <Badge 
                              variant={
                                ticket.status === 'paid' ? 'success' :
                                ticket.status === 'cancelled' ? 'error' : 'warning'
                              }
                            >
                              {ticket.status === 'paid' ? 'Оплачен' :
                               ticket.status === 'cancelled' ? 'Отменён' : 'Ожидает оплаты'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">У вас нет билетов</h3>
                    <p className="text-sm text-muted-foreground mb-4">Посмотрите предстоящие события</p>
                    <Button onClick={() => navigate('/events')}>Купить билеты</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Заявки на аренду льда
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsList && bookingsList.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsList.map((booking: any) => (
                      <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                              <h3 className="font-bold">{booking.date}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Clock className="w-4 h-4" />
                              <span>{booking.time_start} - {booking.time_end}</span>
                              <Badge variant="info" size="sm">{booking.duration_hours}ч</Badge>
                            </div>
                            {booking.message && (
                              <p className="text-sm bg-muted/50 p-2 rounded mt-2">{booking.message}</p>
                            )}
                          </div>
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'success' :
                              booking.status === 'rejected' ? 'error' : 'warning'
                            }
                          >
                            {booking.status === 'approved' ? 'Одобрено' :
                             booking.status === 'rejected' ? 'Отклонено' : 'Ожидает'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">У вас нет заявок на аренду</h3>
                    <p className="text-sm text-muted-foreground mb-4">Забронируйте лёд для своих мероприятий</p>
                    <Button onClick={() => navigate('/booking')}>Забронировать</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Заявки на секции
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsList && requestsList.length > 0 ? (
                  <div className="space-y-4">
                    {requestsList.map((request: any) => (
                      <div key={request.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold mb-2">Заявка #{request.id}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(request.created_at).toLocaleDateString('ru', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            {request.message && (
                              <p className="text-sm bg-muted/50 p-2 rounded">{request.message}</p>
                            )}
                          </div>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'success' :
                              request.status === 'rejected' ? 'error' : 'warning'
                            }
                          >
                            {request.status === 'approved' ? 'Одобрено' :
                             request.status === 'rejected' ? 'Отклонено' : 'Ожидает'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">У вас нет заявок на секции</h3>
                    <p className="text-sm text-muted-foreground mb-4">Подайте заявку на участие в секции</p>
                    <Button onClick={() => navigate('/sections')}>Выбрать секцию</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Modal
          isOpen={isEditMode}
          onClose={() => setIsEditMode(false)}
          title="Редактировать профиль"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Имя</Label>
              <NameInput 
                autoComplete="given-name"
                value={editData.first_name || ''} 
                onChange={(e) => {
                  setEditData({...editData, first_name: e.target.value})
                  if (errors.first_name) setErrors({ ...errors, first_name: '' })
                }}
                placeholder="Иван"
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Фамилия</Label>
              <NameInput 
                autoComplete="family-name"
                value={editData.last_name || ''} 
                onChange={(e) => {
                  setEditData({...editData, last_name: e.target.value})
                  if (errors.last_name) setErrors({ ...errors, last_name: '' })
                }}
                placeholder="Иванов"
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <EmailInput 
                autoComplete="email"
                value={editData.email || ''} 
                onChange={(e) => {
                  setEditData({...editData, email: e.target.value})
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
