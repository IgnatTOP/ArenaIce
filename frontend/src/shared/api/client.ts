import axios from 'axios'
import { API_URL } from '../config/api'

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken })
          localStorage.setItem('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          // Токен невалиден - очищаем и пробуем без токена для публичных эндпоинтов
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          
          // Если это публичный эндпоинт, пробуем запрос без токена
          delete originalRequest.headers.Authorization
          try {
            return await api(originalRequest)
          } catch {
            // Если все равно не работает, редиректим на логин только для приватных эндпоинтов
            if (originalRequest.url?.includes('/admin/') || originalRequest.url?.includes('/me')) {
              window.location.href = '/login'
            }
            return Promise.reject(error)
          }
        }
      } else {
        // Нет refresh токена - пробуем без авторизации для публичных эндпоинтов
        delete originalRequest.headers.Authorization
        try {
          return await api(originalRequest)
        } catch {
          return Promise.reject(error)
        }
      }
    }
    return Promise.reject(error)
  }
)
