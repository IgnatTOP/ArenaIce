export const validators = {
  phone: (value: string) => {
    const phone = value.replace(/[^\d+]/g, '')
    if (!/^\+7\d{10}$/.test(phone)) {
      return 'Неверный формат телефона. Используйте +7 (XXX) XXX-XX-XX'
    }
    return null
  },

  name: (value: string) => {
    if (value.trim().length < 2) {
      return 'Имя должно содержать минимум 2 символа'
    }
    if (!/^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(value)) {
      return 'Имя может содержать только буквы, пробелы и дефисы'
    }
    return null
  },

  message: (value: string) => {
    if (value && value.trim().length < 10) {
      return 'Сообщение должно содержать минимум 10 символов'
    }
    return null
  },

  email: (value: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Неверный формат email'
    }
    return null
  },

  password: (value: string) => {
    if (value.length < 6) {
      return 'Пароль должен содержать минимум 6 символов'
    }
    return null
  },

  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Это поле обязательно'
    }
    return null
  },

  price: (value: number) => {
    if (value <= 0) {
      return 'Цена должна быть больше 0'
    }
    return null
  },

  duration: (value: number) => {
    if (value < 1 || value > 8) {
      return 'Длительность должна быть от 1 до 8 часов'
    }
    return null
  },
}

export const validateField = (value: any, rules: Array<(v: any) => string | null>) => {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

export const validateForm = (data: Record<string, any>, schema: Record<string, Array<(v: any) => string | null>>) => {
  const errors: Record<string, string> = {}
  
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules)
    if (error) {
      errors[field] = error
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}
