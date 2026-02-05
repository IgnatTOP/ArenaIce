import { useQuery, useMutation } from '@tanstack/react-query'
import { bookingApi } from '../../entities/booking/api'
import { Button, Card, Input, Label, Textarea, NameInput, PhoneInput } from '../../shared/ui'
import { useToastStore } from '@/shared/lib/toast'
import { useAuthStore } from '../../entities/user/model/store'
import { validators, validateForm } from '@/shared/lib/validators'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle, DollarSign, Info, CheckCircle2 } from 'lucide-react'

export const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: slots, refetch } = useQuery({
    queryKey: ['available-slots', selectedDate],
    queryFn: async () => (await bookingApi.getAvailableSlots(selectedDate)).data,
    enabled: !!selectedDate,
  })

  const createBooking = useMutation({
    mutationFn: (data: any) => bookingApi.create(data),
    onSuccess: () => {
      addToast('Заявка на аренду отправлена!', 'success')
      setSelectedSlot(null)
      setFormData({ name: '', phone: '', message: '' })
      setErrors({})
      refetch()
    },
    onError: (error: any) => {
      addToast(error.response?.data?.non_field_errors?.[0] || 'Ошибка при создании заявки', 'error')
    },
  })

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot)
    if (!formData.name && !formData.phone) {
      setFormData({
        name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
        phone: user?.phone || '',
        message: ''
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm(formData, {
      name: [validators.required, validators.name],
      phone: [validators.required, validators.phone],
      message: [validators.message],
    })
    
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    
    if (selectedSlot) {
      const start = new Date(`2000-01-01T${selectedSlot.time_start}`)
      const end = new Date(`2000-01-01T${selectedSlot.time_end}`)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      
      createBooking.mutate({
        date: selectedDate,
        time_start: selectedSlot.time_start,
        time_end: selectedSlot.time_end,
        duration_hours: duration,
        ...formData,
      })
    }
  }

  const quickDates = [0, 1, 2, 3, 4, 5, 6].map(days => {
    const date = addDays(new Date(), days)
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: days === 0 ? 'Сегодня' : days === 1 ? 'Завтра' : format(date, 'EEE', { locale: ru }),
      day: format(date, 'd MMM', { locale: ru })
    }
  })

  const priceInfo = [
    { time: '06:00 - 12:00', price: '3000₽/час', desc: 'Утренние часы' },
    { time: '12:00 - 18:00', price: '4000₽/час', desc: 'Дневные часы' },
    { time: '18:00 - 23:00', price: '5000₽/час', desc: 'Вечерние часы' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Аренда льда</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Забронируйте лёд для тренировок, мероприятий или личного использования
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Прайс-лист
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priceInfo.map((item, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="text-sm text-muted-foreground mb-1">{item.desc}</div>
                <div className="font-medium mb-1">{item.time}</div>
                <div className="text-2xl font-bold text-primary">{item.price}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Выберите дату</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {quickDates.map((item) => (
                <button
                  key={item.date}
                  onClick={() => setSelectedDate(item.date)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${selectedDate === item.date 
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg' 
                      : 'border-border hover:border-primary/50'}
                  `}
                >
                  <div className="text-xs font-medium mb-1">{item.label}</div>
                  <div className="text-sm">{item.day}</div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Label htmlFor="date" className="text-sm text-muted-foreground mb-2 block">
                Или выберите другую дату
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="text-lg"
              />
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Доступные слоты на {format(new Date(selectedDate), 'd MMMM', { locale: ru })}
            </h2>
            {slots && slots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {slots.map((slot, i) => {
                  const start = new Date(`2000-01-01T${slot.time_start}`)
                  const end = new Date(`2000-01-01T${slot.time_end}`)
                  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                  
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: slot.is_available ? 1.05 : 1 }}
                      whileTap={{ scale: slot.is_available ? 0.95 : 1 }}
                      onClick={() => slot.is_available && handleSlotSelect(slot)}
                      disabled={!slot.is_available}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-center relative overflow-hidden
                        ${!slot.is_available 
                          ? 'border-red-200 bg-red-50 dark:bg-red-950/20 opacity-60 cursor-not-allowed' 
                          : selectedSlot === slot 
                            ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'}
                      `}
                    >
                      {!slot.is_available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-600 backdrop-blur-sm z-10">
                          <span className="text-sm font-extrabold text-white drop-shadow-2xl tracking-wide">ЗАБРОНИРОВАНО</span>
                        </div>
                      )}
                      {selectedSlot === slot && slot.is_available && (
                        <CheckCircle2 className="absolute top-1 right-1 w-5 h-5 text-primary" />
                      )}
                      <div className={`font-bold text-lg ${!slot.is_available ? 'opacity-50' : ''}`}>{slot.time_start}</div>
                      <div className={`text-xs text-muted-foreground my-1 ${!slot.is_available ? 'opacity-50' : ''}`}>—</div>
                      <div className={`font-bold text-lg ${!slot.is_available ? 'opacity-50' : ''}`}>{slot.time_end}</div>
                      <div className={`text-xs text-muted-foreground mt-2 ${!slot.is_available ? 'opacity-50' : ''}`}>{duration}ч</div>
                      {slot.price && (
                        <div className={`text-sm font-semibold text-primary mt-1 ${!slot.is_available ? 'opacity-50' : ''}`}>
                          {slot.price}₽
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Нет доступных слотов</h3>
                <p className="text-muted-foreground">
                  На выбранную дату все слоты заняты. Попробуйте выбрать другую дату.
                </p>
              </Card>
            )}
          </div>
        </div>

        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="text-xl font-bold mb-6">Заявка на аренду</h3>
            {selectedSlot ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 p-5 rounded-xl space-y-3 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Дата</span>
                    <span className="font-semibold">{format(new Date(selectedDate), 'dd MMMM yyyy', { locale: ru })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Время</span>
                    <span className="font-semibold">
                      {selectedSlot.time_start} - {selectedSlot.time_end}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Длительность</span>
                      <span className="font-semibold">
                        {(() => {
                          const start = new Date(`2000-01-01T${selectedSlot.time_start}`)
                          const end = new Date(`2000-01-01T${selectedSlot.time_end}`)
                          return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)
                        })()} часа
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Ваше имя *</Label>
                  <NameInput
                    id="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                    placeholder="Иван Иванов"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <PhoneInput
                    id="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData({ ...formData, phone: value })
                      if (errors.phone) setErrors({ ...errors, phone: '' })
                    }}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Комментарий</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value })
                      if (errors.message) setErrors({ ...errors, message: '' })
                    }}
                    placeholder="Цель аренды, количество человек... (минимум 10 символов)"
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                </div>

                <Button type="submit" disabled={createBooking.isPending} className="w-full h-12 text-lg font-semibold">
                  {createBooking.isPending ? 'Отправка...' : 'Отправить заявку'}
                </Button>

                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-medium mb-1">Важная информация:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Минимальная аренда - 1 час</li>
                        <li>• Для аренды более 3 часов требуется согласование</li>
                        <li>• Оплата производится при подтверждении заявки</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-2">
                  Выберите доступный слот
                </p>
                <p className="text-sm text-muted-foreground">
                  для бронирования льда
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
