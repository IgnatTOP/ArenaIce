import { useQuery } from '@tanstack/react-query'
import { eventApi } from '../../entities/event/api'
import { EventCard } from '../../widgets/event-card/ui'
import { Skeleton, Input, Button, Card } from '../../shared/ui'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Search, Filter, Calendar, TrendingUp, Clock } from 'lucide-react'

export const EventsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date')
  const [filterUpcoming, setFilterUpcoming] = useState(true)
  
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await eventApi.getAll()).data,
  })

  const events = data?.results || []

  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterUpcoming) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date())
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else {
        return a.price_min - b.price_min
      }
    })

    return filtered
  }, [events, searchQuery, sortBy, filterUpcoming])

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Все события</h1>
        <p className="text-xl text-muted-foreground">
          Хоккейные матчи, фигурное катание, шоу и многое другое
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск событий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={() => setSortBy('date')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                По дате
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                onClick={() => setSortBy('price')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                По цене
              </Button>
            </div>

            <Button
              variant={filterUpcoming ? 'default' : 'outline'}
              onClick={() => setFilterUpcoming(!filterUpcoming)}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {filterUpcoming ? 'Предстоящие' : 'Все'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </Card>
      )}
    </div>
  )
}
