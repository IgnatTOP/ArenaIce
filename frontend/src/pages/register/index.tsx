import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../shared/ui'
import { validators, validateForm } from '@/shared/lib/validators'
import { useToastStore } from '@/shared/lib/toast'
import { motion } from 'framer-motion'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const register = useMutation({
    mutationFn: (data: typeof formData) => api.post('/users/', data),
    onSuccess: () => {
      addToast('Регистрация успешна! Теперь вы можете войти.', 'success')
      navigate('/login')
    },
    onError: (error: any) => {
      addToast(error.response?.data?.email?.[0] || 'Ошибка регистрации', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm(formData, {
      email: [validators.required, validators.email],
      username: [validators.required],
      password: [validators.required, validators.password],
      first_name: [validators.name],
      last_name: [validators.name],
      phone: [validators.phone],
    })
    
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    
    register.mutate(formData)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя *</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value })
                    if (errors.username) setErrors({ ...errors, username: '' })
                  }}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль * (минимум 6 символов)</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Имя</Label>
                  <Input
                    id="first_name"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData({ ...formData, first_name: e.target.value })
                      if (errors.first_name) setErrors({ ...errors, first_name: '' })
                    }}
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Фамилия</Label>
                  <Input
                    id="last_name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData({ ...formData, last_name: e.target.value })
                      if (errors.last_name) setErrors({ ...errors, last_name: '' })
                    }}
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                </div>
              </div>
              
               <div className="space-y-2">
                 <Label htmlFor="phone">Телефон *</Label>
                 <Input
                   id="phone"
                   type="tel"
                   autoComplete="tel"
                   value={formData.phone}
                   onChange={(e) => {
                     let value = e.target.value.replace(/[^\d+]/g, '')
                     // Автоматически добавляем +7 если начинается с 8 или если пусто
                     if (value.startsWith('8')) {
                       value = '+7' + value.slice(1)
                     } else if (!value.startsWith('+7') && value.length > 0) {
                       value = '+7' + value.replace(/\D/g, '')
                     }
                     
                     // Форматируем номер
                     let formatted = value
                     if (value.startsWith('+7')) {
                       const digits = value.replace(/\D/g, '')
                       if (digits.length === 11) {
                         formatted = `+${digits[0]} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9)}`
                       }
                     }
                     
                     setFormData({ ...formData, phone: formatted })
                     if (errors.phone) setErrors({ ...errors, phone: '' })
                   }}
                   placeholder="+7 (999) 123-45-67"
                   className={errors.phone ? 'border-red-500' : ''}
                 />
                 {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
               </div>
              
              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline"
                >
                  Войти
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
