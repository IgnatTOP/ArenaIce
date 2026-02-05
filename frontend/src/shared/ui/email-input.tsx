import React, { useState, useRef, useEffect } from 'react'
import { Input } from './input'

export interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// Популярные домены для автодополнения
const popularDomains = [
  'gmail.com',
  'yandex.ru',
  'mail.ru',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
]

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value = '', onChange, onKeyDown, className, ...props }, ref) => {
    const [suggestion, setSuggestion] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      // Автодополнение домена
      if (value && value.includes('@') && !value.includes('@', value.indexOf('@') + 1)) {
        const [localPart, domainPart = ''] = value.split('@')
        
        if (localPart && domainPart !== undefined) {
          const matchingDomain = popularDomains.find(domain => 
            domain.startsWith(domainPart.toLowerCase()) && domainPart.length > 0
          )
          
          if (matchingDomain && domainPart.length < matchingDomain.length) {
            setSuggestion(`${localPart}@${matchingDomain}`)
          } else {
            setSuggestion('')
          }
        }
      } else {
        setSuggestion('')
      }
    }, [value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Tab или стрелка вправо для автодополнения
      if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion && suggestion !== value) {
        e.preventDefault()
        const syntheticEvent = {
          ...e,
          target: { ...inputRef.current, value: suggestion }
        } as any as React.ChangeEvent<HTMLInputElement>
        onChange?.(syntheticEvent)
        setSuggestion('')
      }
      onKeyDown?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Приводим к нижнему регистру
      const lowerValue = e.target.value.toLowerCase()
      if (lowerValue !== e.target.value) {
        e.target.value = lowerValue
      }
      onChange?.(e)
    }

    return (
      <div className="relative">
        <Input
          ref={(node) => {
            // Поддержка двух рефов
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
            (inputRef as any).current = node
          }}
          type="email"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={className}
          {...props}
        />
        {suggestion && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
            <span className="invisible">{value}</span>
            <span className="text-muted-foreground/40">
              {suggestion.slice(value.length)}
            </span>
          </div>
        )}
      </div>
    )
  }
)

EmailInput.displayName = 'EmailInput'
