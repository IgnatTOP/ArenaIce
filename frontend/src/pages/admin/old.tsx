import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Modal } from '../../shared/ui'
import { useToastStore } from '@/shared/lib/toast'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Ticket, Snowflake, Plus } from 'lucide-react'

export const AdminPage = () => {
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<any>({})

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users/')).data,
  })

  const { data: sections } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => (await api.get('/sections/sections/')).data,
  })

  const { data: memberships } = useQuery({
    queryKey: ['admin-memberships'],
    queryFn: async () => (await api.get('/users/admin/memberships/')).data,
  })

  const { data: sectionRequests } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => (await api.get('/sections/requests/')).data,
  })

  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => (await api.get('/bookings/')).data,
  })

  const addToGroup = useMutation({
    mutationFn: (data: { user_id: number; group_id: number }) =>
      api.post('/users/admin/add-user-to-group/', data),
    onSuccess: () => {
      addToast('Пользователь добавлен в группу', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin-memberships'] })
      setSelectedUser(null)
      setSelectedGroup(null)
    },
    onError: () => addToast('Ошибка при добавлении', 'error'),
  })

  const removeFromGroup = useMutation({
    mutationFn: (membershipId: number) =>
      api.delete(`/users/admin/remove-from-group/?membership_id=${membershipId}`),
    onSuccess: () => {
      addToast('Пользователь удалён из группы', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin-memberships'] })
    },
  })

  const createEntity = useMutation({
    mutationFn: (data: { type: string; payload: any }) => {
      const endpoints: any = {
        event: '/users/admin/create-event/',
        section: '/users/admin/create-section/',
        group: '/users/admin/create-group/',
        schedule: '/users/admin/create-schedule/',
      }
      return api.post(endpoints[data.type], data.payload)
    },
    onSuccess: () => {
      addToast('Создано успешно!', 'success')
      setShowCreateModal(null)
      setCreateForm({})
      queryClient.invalidateQueries()
    },
    onError: () => addToast('Ошибка при создании', 'error'),
  })

  const allSections = sections?.results || sections || []
  const allUsers = users?.results || users || []
  const allBookings = bookings?.results || bookings || []
  const allRequests = sectionRequests?.results || sectionRequests || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Панель администратора</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal('event')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Событие
          </Button>
          <Button onClick={() => setShowCreateModal('section')} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Секция
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Пользователей</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Заявок на секции</p>
                <p className="text-2xl font-bold">{allRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Snowflake className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Заявок на аренду</p>
                <p className="text-2xl font-bold">{allBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Ticket className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Членств в группах</p>
                <p className="text-2xl font-bold">{memberships?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Добавить пользователя в группу</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Пользователь</label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Выберите пользователя</option>
                {allUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Группа</label>
              <select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(Number(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Выберите группу</option>
                {allSections.map((section: any) =>
                  section.groups?.map((group: any) => (
                    <option key={group.id} value={group.id}>
                      {section.name} - {group.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <Button
              onClick={() => selectedUser && selectedGroup && addToGroup.mutate({ user_id: selectedUser, group_id: selectedGroup })}
              disabled={!selectedUser || !selectedGroup || addToGroup.isPending}
              className="w-full"
            >
              Добавить в группу
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущие членства</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {memberships?.map((membership: any) => (
                <motion.div
                  key={membership.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{membership.user_email}</p>
                    <p className="text-sm text-muted-foreground">{membership.group_name}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromGroup.mutate(membership.id)}
                  >
                    Удалить
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Заявки на секции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allRequests.map((request: any) => (
                <div key={request.id} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.phone}</p>
                  <p className="text-sm">{request.message}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.status === 'pending' ? 'bg-yellow-500' :
                    request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заявки на аренду льда</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allBookings.map((booking: any) => (
                <div key={booking.id} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{booking.name}</p>
                  <p className="text-sm">{booking.date} {booking.time_start} - {booking.time_end}</p>
                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'pending' ? 'bg-yellow-500' :
                    booking.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showCreateModal === 'event'}
        onClose={() => setShowCreateModal(null)}
        title="Создать событие"
      >
        <form onSubmit={(e) => { e.preventDefault(); createEntity.mutate({ type: 'event', payload: createForm }) }} className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={createForm.title || ''} onChange={(e) => setCreateForm({...createForm, title: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea value={createForm.description || ''} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип</Label>
              <select value={createForm.event_type || ''} onChange={(e) => setCreateForm({...createForm, event_type: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Выберите</option>
                <option value="hockey">Хоккей</option>
                <option value="figure_skating">Фигурное катание</option>
                <option value="show">Шоу</option>
                <option value="competition">Соревнование</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Дата и время</Label>
              <Input type="datetime-local" value={createForm.date || ''} onChange={(e) => setCreateForm({...createForm, date: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Цена от</Label>
              <Input type="number" value={createForm.price_min || ''} onChange={(e) => setCreateForm({...createForm, price_min: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Цена до</Label>
              <Input type="number" value={createForm.price_max || ''} onChange={(e) => setCreateForm({...createForm, price_max: e.target.value})} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createEntity.isPending}>
            {createEntity.isPending ? 'Создание...' : 'Создать'}
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showCreateModal === 'section'}
        onClose={() => setShowCreateModal(null)}
        title="Создать секцию"
      >
        <form onSubmit={(e) => { e.preventDefault(); createEntity.mutate({ type: 'section', payload: createForm }) }} className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={createForm.name || ''} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea value={createForm.description || ''} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <select value={createForm.section_type || ''} onChange={(e) => setCreateForm({...createForm, section_type: e.target.value})} className="w-full p-2 border rounded-lg" required>
              <option value="">Выберите</option>
              <option value="hockey">Хоккей</option>
              <option value="figure_skating">Фигурное катание</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Цена (₽/мес)</Label>
            <Input type="number" value={createForm.price || ''} onChange={(e) => setCreateForm({...createForm, price: e.target.value})} required />
          </div>
          <Button type="submit" className="w-full" disabled={createEntity.isPending}>
            {createEntity.isPending ? 'Создание...' : 'Создать'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
