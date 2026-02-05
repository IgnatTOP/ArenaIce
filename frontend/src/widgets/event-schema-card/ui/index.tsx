import { useState } from 'react'
import { Card, CardContent, Button, Badge } from '../../../shared/ui'
import { Calendar, DollarSign, Grid, Palette, Eye, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SeatBuilder } from '../../seat-builder/ui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../shared/api/client'

interface EventSchemaCardProps {
  event: any
  schema?: any
}

export const EventSchemaCard = ({ event, schema }: EventSchemaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const queryClient = useQueryClient()

  const { data: seats } = useQuery({
    queryKey: ['seats', schema?.id],
    queryFn: async () => {
      if (!schema?.id) return []
      const res = await api.get(`/events/seats/?schema=${schema.id}`)
      return res.data.results || res.data || []
    },
    enabled: !!schema?.id && isExpanded,
  })

  const createSchemaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/events/seat-schemas/', { event: event.id, schema_data: {} })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seat-schemas'] })
    },
  })

  const availableSeats = (seats || []).filter((s: any) => s.status === 'available')
  const totalSeats = seats?.length || 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl">{event.title}</h3>
                <Badge variant="info" size="sm">{event.event_type}</Badge>
                {schema ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Схема создана
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    <XCircle className="w-3 h-3 mr-1" />
                    Нет схемы
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleString('ru')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{event.price_min}₽ - {event.price_max}₽</span>
                </div>
                {schema && totalSeats > 0 && (
                  <div className="flex items-center gap-1">
                    <Grid className="w-4 h-4" />
                    <span>{availableSeats.length} / {totalSeats} мест доступно</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!schema ? (
                <Button
                  size="sm"
                  onClick={() => createSchemaMutation.mutate()}
                  disabled={createSchemaMutation.isPending}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Создать схему
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={isExpanded ? 'default' : 'outline'}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Скрыть редактор
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 mr-2" />
                      Редактировать схему
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && schema && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t"
            >
              <div className="p-6 bg-muted/30">
                <SeatBuilder
                  schemaId={schema.id}
                  eventPriceMin={event.price_min}
                  eventPriceMax={event.price_max}
                  onSave={() => {
                    queryClient.invalidateQueries({ queryKey: ['seats', schema.id] })
                    queryClient.invalidateQueries({ queryKey: ['admin-seat-schemas'] })
                    setIsExpanded(false)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
