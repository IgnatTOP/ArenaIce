import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './input'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
}

export const SearchBar = ({ placeholder = 'Поиск...', onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  )
}
