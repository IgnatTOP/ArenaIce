import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi, Seat } from '../../entities/event/api'
import { api } from '../../shared/api/client'
import { Button, Card, Skeleton } from '../../shared/ui'
import { SeatMap } from '../../widgets/seat-map/ui'
import { useToastStore } from '@/shared/lib/toast'
import { useAuthStore } from '../../entities/user/model/store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, MapPin, Users, Clock, Info, Ticket, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const { addToast } = useToastStore()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => (await eventApi.getById(Number(id))).data,
  })

  const { data: seats } = useQuery({
    queryKey: ['seats', id],
    queryFn: async () => (await eventApi.getSeats(Number(id))).data,
    enabled: !!id,
  })

  const buyTicket = useMutation({
    mutationFn: async (seatIds: number[]) => {
      const promises = seatIds.map(seatId => 
        api.post('/events/tickets/', { event: Number(id), seat: seatId })
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      addToast(`${selectedSeats.length} билет(ов) успешно забронировано!`, 'success')
      setSelectedSeats([])
      queryClient.invalidateQueries({ queryKey: ['seats', id] })
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        addToast('Войдите в систему для покупки билетов', 'error')
        navigate('/login')
      } else {
        addToast(error.response?.data?.error || 'Ошибка при бронировании билета', 'error')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 mb-8" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!event) return null

  const availableSeats = seats?.filter(s => s.status === 'available').length || 0
  const totalSeats = seats?.length || 0
  const isPast = new Date(event.date) < new Date()

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate('/events')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад к событиям
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {isPast && (
                <div className="absolute top-6 left-6 bg-gray-600 text-white px-4 py-2 rounded-full font-semibold">
                  Событие завершено
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">{event.price_min}₽</span>
                <span className="text-2xl text-muted-foreground">—</span>
                <span className="text-4xl font-bold text-primary">{event.price_max}₽</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Дата и время</p>
                    <p className="font-semibold text-lg">{format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'HH:mm', { locale: ru })}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Место проведения</p>
                    <p className="font-semibold text-lg">Ледовая арена</p>
                    <p className="text-sm text-muted-foreground">Москва</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Доступно мест</p>
                    <p className="font-semibold text-2xl">{availableSeats}</p>
                    <p className="text-xs text-muted-foreground">из {totalSeats}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Длительность</p>
                    <p className="font-semibold text-2xl">~2 часа</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-900">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Описание события</h3>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Ticket className="w-8 h-8 text-primary" />
                Выберите места
              </h2>
              <p className="text-muted-foreground">
                Кликните на свободные места для выбора. Можно выбрать несколько мест.
              </p>
            </div>
          </div>

          {seats && (
            <Card className="p-6">
              <SeatMap
                seats={seats}
                selectedSeat={selectedSeats[selectedSeats.length - 1] || null}
                selectedSeats={selectedSeats}
                onSeatSelect={(seat) => {
                  if (selectedSeats.find(s => s.id === seat.id)) {
                    setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
                  } else {
                    setSelectedSeats([...selectedSeats, seat])
                  }
                }}
              />
            </Card>
          )}
        </motion.section>
      </div>

      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t shadow-2xl z-50"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Выбрано мест: {selectedSeats.length}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSeats.map(seat => (
                    <span key={seat.id} className="text-sm bg-primary/10 px-3 py-1 rounded-full font-medium border border-primary/20">
                      Сектор {seat.sector}, Ряд {seat.row}, Место {seat.number}
                    </span>
                  ))}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">Итого:</span>
                  <span className="text-3xl font-bold text-primary">
                    {selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0)}₽
                  </span>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSeats([])} 
                  className="flex-1 md:flex-none h-12"
                  size="lg"
                >
                  Отменить
                </Button>
                <Button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast('Войдите в систему для покупки билетов', 'error')
                      navigate('/login')
                      return
                    }
                    buyTicket.mutate(selectedSeats.map(s => s.id))
                  }} 
                  disabled={buyTicket.isPending || isPast} 
                  className="flex-1 md:flex-none h-12 text-lg font-semibold"
                  size="lg"
                >
                  {buyTicket.isPending ? 'Бронирование...' : `Купить ${selectedSeats.length} билет(ов)`}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
