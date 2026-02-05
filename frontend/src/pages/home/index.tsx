import { useQuery } from '@tanstack/react-query'
import { eventApi } from '../../entities/event/api'
import { EventCard } from '../../widgets/event-card/ui'
import { BannerSlider } from '../../widgets/banner-slider/ui'
import { ExpandableProgramCard } from '../../widgets/expandable-program-card/ui'
import { Button, Card } from '../../shared/ui'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, Users, Trophy, Snowflake, Star, Clock, Award, 
  TrendingUp, ArrowRight, Play, CheckCircle, Sparkles, Target,
  Shield, Zap, Heart, MessageCircle
} from 'lucide-react'
import { useState } from 'react'

export const HomePage = () => {
  const navigate = useNavigate()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await eventApi.getAll()).data,
  })

  const events = data?.results || []

  const bannerSlides = [
    {
      id: 'slide-1',
      image: '/img/IMG_6676.JPG',
      title: 'Лучшая ледовая арена Москвы',
      subtitle: 'Профессиональное обучение и тренировки',
    },
    {
      id: 'slide-2',
      image: '/img/IMG_4582.JPG',
      title: 'Фигурное катание',
      subtitle: 'Занятия для всех возрастов и уровней',
    },
    {
      id: 'slide-3',
      image: '/img/IMG_6682.JPG',
      title: 'Хоккейная школа',
      subtitle: 'Подготовка профессионалов',
    },
    {
      id: 'slide-4',
      image: '/img/IMG_4583.JPG',
      title: 'Семейное катание',
      subtitle: 'Развлечение для всей семьи',
    },
  ]

  const stats = [
    { label: 'Довольных клиентов', value: '2500+', icon: Heart, gradient: 'from-pink-500 to-rose-500' },
    { label: 'Профессиональных тренеров', value: '25', icon: Award, gradient: 'from-purple-500 to-indigo-500' },
    { label: 'Лет на рынке', value: '12', icon: Trophy, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Событий в год', value: '100+', icon: Sparkles, gradient: 'from-cyan-500 to-blue-500' },
  ]

  const features = [
    {
      icon: Trophy,
      title: 'Чемпионские тренеры',
      desc: 'Мастера спорта и призеры международных соревнований',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Snowflake,
      title: 'Премиум оборудование',
      desc: 'Профессиональный лёд и современное оснащение',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Группы до 10 человек',
      desc: 'Индивидуальный подход к каждому ученику',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Гибкое расписание',
      desc: 'Утренние, дневные и вечерние занятия',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Безопасность',
      desc: 'Страховка и медицинское сопровождение',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Результат',
      desc: 'Гарантированный прогресс за 3 месяца',
      color: 'from-indigo-500 to-purple-500'
    },
  ]

  const testimonials = [
    {
      name: 'Анна Михайлова',
      role: 'Мама ученицы',
      text: 'Дочь занимается фигурным катанием уже 3 года. Невероятный прогресс! Тренеры профессионалы своего дела, всегда находят подход к детям.',
      rating: 5,
      avatar: '👩'
    },
    {
      name: 'Дмитрий Козлов',
      role: 'Хоккеист-любитель',
      text: 'Отличная арена для тренировок! Удобное расписание, качественный лёд, современные раздевалки. Рекомендую всем!',
      rating: 5,
      avatar: '👨'
    },
    {
      name: 'Елена Соколова',
      role: 'Организатор мероприятий',
      text: 'Проводили корпоративное мероприятие - всё на высшем уровне! Профессиональная команда, отличный сервис.',
      rating: 5,
      avatar: '👩‍💼'
    },
  ]

  const programs = [
    {
      title: 'Фигурное катание',
      desc: 'Для детей от 4 лет и взрослых',
      price: 'от 5000₽',
      features: ['Групповые занятия', 'Индивидуальные уроки', 'Подготовка к соревнованиям'],
      color: 'from-pink-500 to-purple-500',
      icon: '⛸️',
      image: '/img/IMG_6676.JPG',
    },
    {
      title: 'Хоккей',
      desc: 'Детские и взрослые группы',
      price: 'от 6000₽',
      features: ['Техника катания', 'Командная игра', 'Физическая подготовка'],
      color: 'from-blue-500 to-cyan-500',
      icon: '🏒',
      image: '/img/IMG_4582.JPG',
    },
    {
      title: 'Массовое катание',
      desc: 'Для всей семьи',
      price: 'от 500₽',
      features: ['Прокат коньков', 'Музыкальное сопровождение', 'Безопасная среда'],
      color: 'from-green-500 to-emerald-500',
      icon: '⛷️',
      image: '/img/IMG_6682.JPG',
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Banner Slider */}
      <section className="relative h-[calc(100vh-5rem)] w-full z-0">
        <div className="absolute inset-0 z-0">
          <BannerSlider slides={bannerSlides} autoPlay autoPlayDelay={6000} />
        </div>

        <div className="relative z-10 h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-white px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="inline-block mb-2 md:mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
              ❄️ Лучшая ледовая арена Москвы
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight drop-shadow-lg text-center px-4">
              Ледовая Арена
            </h1>
            <p className="text-base md:text-lg lg:text-2xl text-white drop-shadow-lg leading-relaxed text-center max-w-3xl px-4">
              Профессиональное обучение хоккею и фигурному катанию.<br />
              Яркие события. Аренда льда для ваших целей.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 mt-8 md:mt-12 relative z-10 px-4"
          >
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate('/sections')}
              className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Записаться в секцию
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/events')}
              className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-white/10 hover:bg-white/20 text-white border-2 border-white backdrop-blur-sm"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Смотреть события
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-xs md:text-sm relative z-10 drop-shadow-lg px-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Первое занятие бесплатно</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Прокат коньков включен</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white rounded-full"></div>
              </div>
            </motion.div>
           </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
               >
                <Card className="p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 border-2">
                  <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Programs Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center mb-12 md:mb-20 px-4"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Наши программы
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Выберите направление, которое подходит именно вам
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
              {programs.map((program, i) => (
                <motion.div
                  key={program.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  <ExpandableProgramCard {...program} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Почему выбирают нас</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Мы создали идеальные условия для вашего развития
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
              >
                <Card className="p-6 md:p-8 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2">
                  <div className={`w-12 h-12 md:w-14 md:h-14 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 md:mb-12 px-4">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Ближайшие события</h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
                Не пропустите захватывающие матчи и шоу
              </p>
            </div>
            <Button variant="outline" size="lg" onClick={() => navigate('/events')} className="w-full md:w-auto">
              Все события
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {events.slice(0, 3).map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                >
                  <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">Скоро здесь появятся новые события</p>
            </Card>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Отзывы наших клиентов</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Узнайте, что говорят о нас те, кто уже с нами
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                >
                   <Card className="p-6 md:p-8 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="text-3xl md:text-4xl">{testimonial.avatar}</div>
                       <div>
                         <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                         <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                       </div>
                     </div>
                     <div className="flex gap-1 mb-4">
                       {[...Array(testimonial.rating)].map((_, j) => (
                         <Star key={j} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                       ))}
                     </div>
                     <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed flex-grow">
                       "{testimonial.text}"
                     </p>
                   </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold px-4">
              Готовы начать свой путь на льду?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 px-4">
              Запишитесь на бесплатное пробное занятие прямо сейчас!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 pt-4 px-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/sections')}
                className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold shadow-xl"
              >
                Записаться на занятие
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/booking')}
                className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-white/10 hover:bg-white/20 text-white border-2 border-white"
              >
                <Snowflake className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Арендовать лёд
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
