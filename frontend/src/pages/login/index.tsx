import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { useAuthStore } from '../../entities/user/model/store'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../shared/ui'
import { useToastStore } from '@/shared/lib/toast'
import { validators, validateForm } from '@/shared/lib/validators'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { addToast } = useToastStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const login = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: tokens } = await api.post('/token/', data)
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      const { data: user } = await api.get('/users/me/')
      return user
    },
    onSuccess: (user) => {
      setUser(user)
      addToast('Добро пожаловать!', 'success')
      navigate('/profile')
    },
    onError: () => {
      addToast('Неверный email или пароль', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm(formData, {
      email: [validators.required, validators.email],
      password: [validators.required],
    })
    
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    
    login.mutate(formData)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Вход в систему</CardTitle>
            <p className="text-muted-foreground mt-2">Войдите в свой аккаунт</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    placeholder="your@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (errors.password) setErrors({ ...errors, password: '' })
                    }}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={login.isPending}>
                {login.isPending ? 'Вход...' : 'Войти'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-primary hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
