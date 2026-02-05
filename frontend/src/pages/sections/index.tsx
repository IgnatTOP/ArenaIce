import { useQuery, useMutation } from '@tanstack/react-query'
import { sectionApi } from '../../entities/section/api'
import { Button, Card, CardContent, Input, Textarea, Label, Modal } from '../../shared/ui'
import { useToastStore } from '@/shared/lib/toast'
import { useAuthStore } from '../../entities/user/model/store'
import { validators, validateForm } from '@/shared/lib/validators'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Clock, Users, DollarSign, CheckCircle, Award, Target } from 'lucide-react'

export const SectionsPage = () => {
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionApi.getAll()).data,
  })

  const sections = data?.results || data || []

  const createRequest = useMutation({
    mutationFn: (data: typeof formData & { section: number }) =>
      sectionApi.createRequest(data),
    onSuccess: () => {
      addToast('Заявка успешно отправлена!', 'success')
      setSelectedSection(null)
      setFormData({ name: '', phone: '', message: '' })
      setErrors({})
    },
    onError: () => addToast('Ошибка при отправке заявки', 'error'),
  })

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
    
    if (selectedSection) {
      createRequest.mutate({ ...formData, section: selectedSection })
    }
  }

  const handleOpenModal = (sectionId: number) => {
    setSelectedSection(sectionId)
    setErrors({})
    setFormData({
      name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
      phone: user?.phone || '',
      message: ''
    })
  }

  const selectedSectionData = sections.find((s: any) => s.id === selectedSection)

  const benefits = [
    { icon: Award, title: 'Сертифицированные тренеры', desc: 'Мастера спорта и заслуженные тренеры' },
    { icon: Target, title: 'Индивидуальный подход', desc: 'Программы для любого уровня подготовки' },
    { icon: Users, title: 'Малые группы', desc: 'До 12 человек для эффективного обучения' },
    { icon: CheckCircle, title: 'Современное оснащение', desc: 'Качественный инвентарь и экипировка' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Наши секции</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Профессиональное обучение хоккею и фигурному катанию для детей и взрослых
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
        {benefits.map((benefit, i) => (
          <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
            <benefit.icon className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground">{benefit.desc}</p>
          </Card>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section: any, i: number) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden group">
                  <img
                    src={section.image}
                    alt={section.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-4xl font-bold text-white mb-2">{section.name}</h2>
                    <div className="flex items-center gap-3 text-white/90">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-2xl font-bold">{section.price}₽</span>
                        <span className="text-sm">/мес</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{section.description}</p>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Группы и расписание
                    </h3>
                    {section.groups?.map((group: any) => (
                      <div key={group.id} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-lg space-y-3 border border-blue-100 dark:border-blue-900">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{group.name}</h4>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium">{group.members_count}/{group.max_members}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {group.schedules.map((schedule: any) => (
                            <div key={schedule.id} className="flex items-center gap-3 text-sm bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="font-medium min-w-[80px]">{schedule.day_name}:</span>
                              <span className="text-muted-foreground">
                                {schedule.time_start} - {schedule.time_end}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-semibold"
                    onClick={() => handleOpenModal(section.id)}
                  >
                    Записаться в секцию
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedSection}
        onClose={() => setSelectedSection(null)}
        title={`Запись в секцию: ${selectedSectionData?.name}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше имя *</Label>
            <Input
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
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (errors.phone) setErrors({ ...errors, phone: '' })
              }}
              placeholder="+7 (999) 123-45-67"
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
              placeholder="Расскажите о себе или задайте вопрос... (минимум 10 символов)"
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedSection(null)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createRequest.isPending} className="flex-1">
              {createRequest.isPending ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
