import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui'
import { Event } from '../../../entities/event/api'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, MapPin, Tag } from 'lucide-react'

interface EventCardProps {
  event: Event
  onClick: () => void
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const isPast = new Date(event.date) < new Date()
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer h-full"
    >
      <Card className="overflow-hidden h-full hover:shadow-2xl transition-shadow duration-300 group">
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {isPast && (
            <div className="absolute top-3 left-3 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Завершено
            </div>
          )}
          
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm bg-primary/90">
            от {event.price_min}₽
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
        
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {format(new Date(event.date), 'dd MMMM yyyy', { locale: ru })}
              </div>
              <div className="text-xs">
                {format(new Date(event.date), 'HH:mm', { locale: ru })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
            <span className="text-sm">Ледовая арена</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {event.price_min}₽ - {event.price_max}₽
              </span>
            </div>
            <span className="text-xs text-primary font-semibold group-hover:underline">
              Подробнее →
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
