import { useState, useEffect } from 'react'
import { Button, Card, Input, Label } from '../../../shared/ui'
import { Plus, Trash2, Save, Grid3x3, Wand2, Undo2, Redo2, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SeatBuilderProps {
  schemaId: number
  eventPriceMin: number
  eventPriceMax: number
  onSave: () => void
}

interface PriceZone {
  name: string
  price: number
  color: string
}

type Tool = 'brush' | 'eraser' | 'fill'

export const SeatBuilder = ({ schemaId, eventPriceMin, eventPriceMax, onSave }: SeatBuilderProps) => {
  const colors = [
    'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 
    'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400',
    'bg-cyan-400', 'bg-teal-400', 'bg-lime-400', 'bg-amber-400'
  ]

  const [sectors, setSectors] = useState<string[]>(['A'])
  const [rows, setRows] = useState(10)
  const [seatsPerRow, setSeatsPerRow] = useState(20)
  const [selectedCells, setSelectedCells] = useState<Map<string, number>>(new Map())
  const [priceZones, setPriceZones] = useState<PriceZone[]>([
    { name: 'VIP', price: eventPriceMax, color: 'bg-yellow-400' },
    { name: 'Стандарт', price: Math.round((eventPriceMin + eventPriceMax) / 2), color: 'bg-blue-400' },
    { name: 'Эконом', price: eventPriceMin, color: 'bg-green-400' },
  ])
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0)
  const [currentTool, setCurrentTool] = useState<Tool>('brush')
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Map<string, number>[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGrid, setShowGrid] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const loadSeats = async () => {
      try {
        const { api } = await import('../../../shared/api/client')
        const res = await api.get(`/events/seats/?schema=${schemaId}`)
        const allSeats = res.data.results || res.data || []
        
        if (allSeats.length > 0) {
          const allSectors = [...new Set(allSeats.map((s: any) => s.sector))].sort()
          const maxRow = Math.max(...allSeats.map((s: any) => s.row))
          const maxSeat = Math.max(...allSeats.map((s: any) => s.number))
          
          setSectors(allSectors)
          setRows(maxRow)
          setSeatsPerRow(maxSeat)
          
          const availableSeats = allSeats.filter((s: any) => s.status === 'available')
          const prices = [...new Set(availableSeats.map((s: any) => parseFloat(s.price)))].filter(p => p > 0).sort((a, b) => b - a)
          
          if (prices.length > 0) {
            const zones = prices.map((price, i) => ({
              name: `Зона ${i + 1}`,
              price,
              color: colors[i % colors.length]
            }))
            setPriceZones(zones)
            
            const newSelected = new Map()
            availableSeats.forEach((seat: any) => {
              const seatPrice = parseFloat(seat.price)
              const zoneIndex = prices.indexOf(seatPrice)
              if (zoneIndex >= 0) {
                newSelected.set(`${seat.sector}-${seat.row}-${seat.number}`, zoneIndex)
              }
            })
            setSelectedCells(newSelected)
            setHistory([new Map(newSelected)])
            setHistoryIndex(0)
          }
        } else {
          setHistory([new Map()])
          setHistoryIndex(0)
        }
      } catch (e) {
        console.error('Ошибка загрузки:', e)
      } finally {
        setLoading(false)
      }
    }
    loadSeats()
  }, [schemaId])

  const saveToHistory = (newState: Map<string, number>) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(new Map(newState))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSelectedCells(new Map(history[historyIndex - 1]))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSelectedCells(new Map(history[historyIndex + 1]))
    }
  }

  const handleCell = (sector: string, row: number, seat: number) => {
    const key = `${sector}-${row}-${seat}`
    const newSelected = new Map(selectedCells)
    
    if (currentTool === 'eraser') {
      newSelected.delete(key)
    } else if (currentTool === 'brush') {
      newSelected.set(key, currentZoneIndex)
    }
    
    setSelectedCells(newSelected)
    if (!isDragging) {
      saveToHistory(newSelected)
    }
  }

  const fillSector = (sector: string) => {
    const newSelected = new Map(selectedCells)
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        newSelected.set(`${sector}-${row}-${seat}`, currentZoneIndex)
      }
    }
    setSelectedCells(newSelected)
    saveToHistory(newSelected)
  }

  const getCellColor = (sector: string, row: number, seat: number) => {
    const key = `${sector}-${row}-${seat}`
    if (!selectedCells.has(key)) return 'bg-gray-200 dark:bg-gray-700'
    return priceZones[selectedCells.get(key)!].color
  }

  const templates = [
    { name: 'Малый зал', sectors: ['A', 'B'], rows: 5, seats: 10 },
    { name: 'Средний зал', sectors: ['A', 'B', 'C'], rows: 10, seats: 15 },
    { name: 'Большой зал', sectors: ['A', 'B', 'C', 'D'], rows: 15, seats: 20 },
  ]

  return (
    <div className="space-y-4">
      {/* Панель инструментов */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={currentTool === 'brush' ? 'default' : 'outline'}
              onClick={() => setCurrentTool('brush')}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Кисть
            </Button>
            <Button
              size="sm"
              variant={currentTool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setCurrentTool('eraser')}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Ластик
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Шаблоны */}
      <Card className="p-4">
        <Label className="mb-3 block">Быстрые шаблоны</Label>
        <div className="flex gap-2 flex-wrap">
          {templates.map((t) => (
            <Button
              key={t.name}
              size="sm"
              variant="outline"
              onClick={() => {
                setSectors(t.sectors)
                setRows(t.rows)
                setSeatsPerRow(t.seats)
              }}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              {t.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Настройки */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Рядов</Label>
            <Input type="number" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="30" />
          </div>
          <div>
            <Label>Мест в ряду</Label>
            <Input type="number" value={seatsPerRow} onChange={(e) => setSeatsPerRow(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="50" />
          </div>
          <div>
            <Label>Секторов: {sectors.length}</Label>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setSectors([...sectors, String.fromCharCode(65 + sectors.length)])} disabled={sectors.length >= 10}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => sectors.length > 1 && setSectors(sectors.slice(0, -1))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Очистить</Label>
            <Button size="sm" variant="outline" onClick={() => { const empty = new Map(); setSelectedCells(empty); saveToHistory(empty); }} className="w-full">
              Сбросить
            </Button>
          </div>
        </div>
      </Card>

      {/* Ценовые зоны */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Label>Ценовые зоны</Label>
          <Button size="sm" onClick={() => setPriceZones([...priceZones, { name: `Зона ${priceZones.length + 1}`, price: eventPriceMin, color: colors[priceZones.length % colors.length] }])}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {priceZones.map((zone, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border-2 cursor-pointer transition ${currentZoneIndex === i ? 'border-primary shadow-md' : 'border-border'}`}
              onClick={() => setCurrentZoneIndex(i)}
            >
              <div className="flex justify-between mb-2">
                <Input value={zone.name} onChange={(e) => { const z = [...priceZones]; z[i].name = e.target.value; setPriceZones(z); }} onClick={(e) => e.stopPropagation()} />
                {priceZones.length > 1 && (
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setPriceZones(priceZones.filter((_, idx) => idx !== i)); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input type="number" value={zone.price} onChange={(e) => { const z = [...priceZones]; z[i].price = parseFloat(e.target.value) || 0; setPriceZones(z); }} onClick={(e) => e.stopPropagation()} />
              <div className="flex gap-1 mt-2 flex-wrap">
                {colors.map((c) => (
                  <button key={c} className={`w-6 h-6 rounded ${c} ${zone.color === c ? 'ring-2 ring-primary' : ''}`} onClick={(e) => { e.stopPropagation(); const z = [...priceZones]; z[i].color = c; setPriceZones(z); }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Карта мест */}
      <Card className="p-4">
        <div className="mb-4 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-lg border-2 border-dashed">
            <span className="font-medium">ЛЁД / СЦЕНА</span>
          </div>
        </div>

        <div className="space-y-6">
          {sectors.map((sector) => (
            <div key={sector}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Сектор {sector}</h4>
                <Button size="sm" variant="outline" onClick={() => fillSector(sector)}>
                  Заполнить сектор
                </Button>
              </div>
              <div className="overflow-x-auto">
                <div className="inline-block">
                  {Array.from({ length: rows }, (_, r) => (
                    <div key={r} className="flex gap-1 mb-1">
                      <span className="text-xs w-6 text-right text-muted-foreground">{r + 1}</span>
                      {Array.from({ length: seatsPerRow }, (_, s) => (
                        <button
                          key={s}
                          onMouseDown={() => { setIsDragging(true); handleCell(sector, r + 1, s + 1); }}
                          onMouseEnter={() => isDragging && handleCell(sector, r + 1, s + 1)}
                          onMouseUp={() => { if (isDragging) { setIsDragging(false); saveToHistory(selectedCells); } }}
                          className={`w-6 h-6 text-[10px] rounded transition ${getCellColor(sector, r + 1, s + 1)} ${showGrid ? 'border border-gray-300 dark:border-gray-600' : ''} hover:opacity-80`}
                        >
                          {selectedCells.has(`${sector}-${r + 1}-${s + 1}`) ? s + 1 : ''}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Сохранение */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Выбрано мест: {selectedCells.size}</p>
            <p className="text-sm text-muted-foreground">Секторов: {sectors.length} | Рядов: {rows} | Мест: {seatsPerRow}</p>
          </div>
          <Button
            size="lg"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true)
                const { api } = await import('../../../shared/api/client')
                await api.post('/events/seats/bulk_delete/', { schema_id: schemaId })
                
                const seats: any[] = []
                for (const sector of sectors) {
                  for (let row = 1; row <= rows; row++) {
                    for (let number = 1; number <= seatsPerRow; number++) {
                      const key = `${sector}-${row}-${number}`
                      if (selectedCells.has(key)) {
                        seats.push({ schema: schemaId, sector, row, number, price: priceZones[selectedCells.get(key)!].price, status: 'available' })
                      } else {
                        seats.push({ schema: schemaId, sector, row, number, price: 0, status: 'sold' })
                      }
                    }
                  }
                }
                
                await api.post('/events/seats/bulk_create/', { seats })
                setLoading(false)
                onSave()
              } catch (e: any) {
                setLoading(false)
                alert('Ошибка: ' + JSON.stringify(e.response?.data || e.message))
              }
            }}
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
