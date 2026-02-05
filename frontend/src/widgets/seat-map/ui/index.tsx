import { motion } from 'framer-motion'
import { Seat } from '../../../entities/event/api'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/ui'

interface SeatMapProps {
  seats: Seat[]
  selectedSeat: Seat | null
  onSeatSelect: (seat: Seat) => void
  selectedSeats?: Seat[]
}

export const SeatMap = ({ seats, selectedSeat, onSeatSelect, selectedSeats = [] }: SeatMapProps) => {
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  // Группируем ВСЕ места, включая с нулевой ценой
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.sector]) acc[seat.sector] = {}
    if (!acc[seat.sector][seat.row]) acc[seat.sector][seat.row] = []
    acc[seat.sector][seat.row].push(seat)
    return acc
  }, {} as Record<string, Record<number, Seat[]>>)

  const availableSeats = seats.filter(s => parseFloat(s.price) > 0)

  const getPriceColor = (price: number) => {
    const prices = [...new Set(availableSeats.map(s => parseFloat(s.price)))].sort((a, b) => b - a)
    const index = prices.indexOf(parseFloat(price.toString()))
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400']
    return colors[index % colors.length]
  }

  const getSeatColor = (seat: Seat) => {
    // Места с нулевой ценой - пустые (форма зала)
    if (parseFloat(seat.price) === 0) return 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed opacity-30'
    
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    if (isSelected) return 'bg-primary text-primary-foreground ring-2 ring-primary'
    if (seat.status === 'available') return `${getPriceColor(parseFloat(seat.price))} hover:opacity-80 text-white`
    if (seat.status === 'reserved') return 'bg-gray-400 text-white cursor-not-allowed opacity-50'
    return 'bg-gray-600 text-white cursor-not-allowed opacity-30'
  }

  const priceZones = [...new Set(availableSeats.map(s => parseFloat(s.price)))].sort((a, b) => b - a)
  const sectors = Object.keys(groupedSeats).sort()

  return (
    <div className={`space-y-4 ${fullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={() => setFullscreen(!fullscreen)}>
          <Maximize2 className="w-4 h-4 mr-2" />
          {fullscreen ? 'Выход' : 'Полный экран'}
        </Button>
      </div>

      <div className="overflow-auto max-h-[600px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <div className="mb-4 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-lg border-2 border-dashed border-primary/30">
            <span className="font-medium">ЛЁД / СЦЕНА</span>
          </div>
        </div>

        <div className="space-y-6">
          {sectors.map((sector) => (
            <motion.div key={sector} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h4 className="text-lg font-bold mb-3 text-center">Сектор {sector}</h4>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {Object.entries(groupedSeats[sector])
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([row, rowSeats]) => (
                      <div key={row} className="flex items-center gap-1 mb-1">
                        <span className="text-xs w-8 text-right text-muted-foreground">{row}</span>
                        {(rowSeats as any[])
                          .sort((a, b) => a.number - b.number)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => seat.status === 'available' && parseFloat(seat.price) > 0 && onSeatSelect(seat)}
                              disabled={seat.status !== 'available' || parseFloat(seat.price) === 0}
                              className={`w-6 h-6 text-[10px] rounded transition-all ${getSeatColor(seat)}`}
                              title={parseFloat(seat.price) === 0 ? 'Недоступно' : `Сектор ${seat.sector}, Ряд ${seat.row}, Место ${seat.number}\nЦена: ${seat.price}₽`}
                            >
                              {(selectedSeats.some(s => s.id === seat.id) || (seat.status === 'available' && parseFloat(seat.price) > 0)) ? seat.number : ''}
                            </button>
                          ))}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-bold mb-3 text-center">Легенда</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {priceZones.map((price, i) => (
            <div key={i} className="flex items-center gap-2 bg-background p-2 rounded">
              <div className={`w-8 h-8 rounded ${getPriceColor(price)}`}></div>
              <div className="text-sm">
                <div className="font-bold">{price}₽</div>
                <div className="text-xs text-muted-foreground">Зона {i + 1}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded ring-2 ring-primary"></div>
            <span className="text-sm font-medium">Выбрано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded opacity-50"></div>
            <span className="text-sm">Забронировано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded opacity-30"></div>
            <span className="text-sm">Продано</span>
          </div>
        </div>
      </div>
    </div>
  )
}
