import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ExpandableProgramCardProps {
  title: string
  desc: string
  price: string
  features: string[]
  color: string
  icon: string
  image: string
}

export const ExpandableProgramCard = ({
  title,
  desc,
  price,
  features,
  color,
  icon,
  image,
}: ExpandableProgramCardProps) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative w-full h-auto md:h-[520px] cursor-pointer rounded-3xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative h-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-shadow duration-300 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
        
        {/* Background Image Overlay - появляется при hover */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            {/* Icon */}
            <motion.div
              className="mb-4 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center"
              animate={{ 
                scale: isHovered ? 0.9 : 1,
                rotate: isHovered ? -5 : 0 
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-6xl md:text-7xl drop-shadow-lg">{icon}</span>
            </motion.div>

            {/* Title */}
            <motion.h3
              className="font-bold leading-tight mb-2 text-2xl md:text-3xl transition-colors duration-300"
              animate={{
                color: isHovered ? '#ffffff' : undefined
              }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-sm md:text-base leading-relaxed mb-4 transition-colors duration-300"
              animate={{
                color: isHovered ? '#e5e7eb' : undefined
              }}
            >
              {desc}
            </motion.p>

            {/* Price */}
            <div className={`text-3xl md:text-4xl font-extrabold mb-6 ${isHovered ? 'text-white' : `bg-gradient-to-r ${color} bg-clip-text text-transparent`} transition-all duration-300`}>
              {price}
            </div>

            {/* Features */}
            <div className="space-y-3 flex-1">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                  }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${isHovered ? 'text-green-400' : 'text-green-500'}`} />
                  <motion.span
                    className="text-sm font-medium leading-snug transition-colors duration-300"
                    animate={{
                      color: isHovered ? '#f3f4f6' : undefined
                    }}
                  >
                    {feature}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 relative z-20">
            <motion.button
              onClick={() => navigate('/sections')}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold py-3 md:py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm md:text-base"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Записаться
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
