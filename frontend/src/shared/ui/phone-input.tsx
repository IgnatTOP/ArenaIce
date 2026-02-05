import React from 'react'
import { IMaskInput } from 'react-imask'
import { cn } from '../lib/utils'

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string, unmasked: string) => void
  onAccept?: (value: string, maskRef: any) => void
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, onAccept, ...props }, ref) => {
    return (
      <IMaskInput
        mask="+7 (000) 000-00-00"
        value={value}
        unmask={false}
        onAccept={(value, maskRef) => {
          const unmasked = maskRef.unmaskedValue
          onChange?.(value, unmasked)
          onAccept?.(value, maskRef)
        }}
        inputRef={ref as any}
        placeholder="+7 (999) 123-45-67"
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
