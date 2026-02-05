import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './styles.css'

interface BannerSlide {
  id: string
  image: string
  title?: string
  subtitle?: string
}

interface BannerSliderProps {
  slides: BannerSlide[]
  autoPlay?: boolean
  autoPlayDelay?: number
}

export const BannerSlider = ({ 
  slides, 
  autoPlay = true, 
  autoPlayDelay = 6000 
}: BannerSliderProps) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={autoPlay ? { delay: autoPlayDelay, disableOnInteraction: false } : false}
      loop
      className="w-full h-full banner-slider"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id} className="w-full h-full">
          <img
            src={slide.image}
            alt={slide.title || 'Slide'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
