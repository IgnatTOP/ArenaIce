import { useQuery, useMutation } from '@tanstack/react-query'
import { sectionApi } from '../../entities/section/api'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from '../../shared/ui'
import { MEDIA_URL } from '../../shared/config/api'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Clock } from 'lucide-react'

export const SectionsPage = () => {
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionApi.getAll()).data,
  })

  const sections = data?.results || data || []

  const createRequest = useMutation({
    mutationFn: (data: typeof formData & { section: number }) =>
      sectionApi.createRequest(data),
    onSuccess: () => {
      alert('Заявка отправлена!')
      setSelectedSection(null)
      setFormData({ name: '', phone: '', message: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSection) {
      createRequest.mutate({ ...formData, section: selectedSection })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Секции
      </motion.h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections?.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden h-full">
                <img
                  src={`${MEDIA_URL}/${section.image}`}
                  alt={section.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle>{section.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{section.description}</p>
                  <div className="text-2xl font-bold text-primary">{section.price}₽/мес</div>
                  
                  {section.groups.map((group) => (
                    <div key={group.id} className="border-t pt-4">
                      <h4 className="font-semibold mb-2">{group.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Мест: {group.members_count}/{group.max_members}
                      </p>
                      <div className="space-y-1">
                        {group.schedules.map((schedule) => (
                          <div key={schedule.id} className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              {schedule.day_name}: {schedule.time_start} - {schedule.time_end}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    className="w-full"
                    onClick={() => setSelectedSection(section.id)}
                  >
                    Записаться
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedSection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSection(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Заявка на запись</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Телефон</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Сообщение</label>
                <Input
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setSelectedSection(null)} className="flex-1">
                  Отмена
                </Button>
                <Button type="submit" className="flex-1">
                  Отправить
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
