import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../../shared/ui'
import { useAuthStore } from '../../../entities/user/model/store'
import { Menu, X, User, LogOut, Calendar, Users, Snowflake, Home, Shield, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    // Перезагружаем страницу для полной очистки кеша
    window.location.href = '/'
  }

  const navLinks = [
    { to: '/', label: 'Главная', icon: Home },
    { to: '/events', label: 'События', icon: Calendar },
    { to: '/sections', label: 'Секции', icon: Users },
    { to: '/booking', label: 'Аренда льда', icon: Snowflake },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b shadow-lg' 
        : 'bg-background/95 backdrop-blur-md border-b'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg"
            >
              <Snowflake className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                ArenaIce
              </div>
              <div className="text-xs text-muted-foreground -mt-1">Ледовая арена</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.first_name || user?.username || 'Профиль'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-background border rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
                        <div className="font-semibold">
                          {user?.first_name && user?.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user?.username || 'Пользователь'}
                        </div>
                        <div className="text-xs opacity-90">{user?.email || ''}</div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate('/profile')
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <User className="w-4 h-4" />
                          <span>Мой профиль</span>
                        </button>
                        {user?.is_staff && (
                          <button
                            onClick={() => {
                              navigate('/admin')
                              setUserMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Админ-панель</span>
                          </button>
                        )}
                        <div className="my-2 border-t" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Выйти</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="font-medium"
                >
                  Войти
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  Регистрация
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg">
                      <div className="font-semibold">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user?.username || 'Пользователь'}
                      </div>
                      <div className="text-xs opacity-90">{user?.email || ''}</div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/profile')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Мой профиль
                    </Button>
                    {user?.is_staff && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/admin')
                          setMobileMenuOpen(false)
                        }}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Админ-панель
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        navigate('/login')
                        setMobileMenuOpen(false)
                      }}
                    >
                      Войти
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                      onClick={() => {
                        navigate('/register')
                        setMobileMenuOpen(false)
                      }}
                    >
                      Регистрация
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
