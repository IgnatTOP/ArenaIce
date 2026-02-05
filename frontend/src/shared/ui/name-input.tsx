import React from 'react'
import { Input } from './input'

export interface NameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// Функция для капитализации первой буквы каждого слова
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export const NameInput = React.forwardRef<HTMLInputElement, NameInputProps>(
  ({ value = '', onChange, onBlur, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Капитализируем при потере фокуса
      if (e.target.value) {
        const capitalized = capitalizeWords(e.target.value.trim())
        if (capitalized !== e.target.value) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: capitalized }
          } as React.ChangeEvent<HTMLInputElement>
          onChange?.(syntheticEvent)
        }
      }
      onBlur?.(e)
    }

    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)

NameInput.displayName = 'NameInput'
