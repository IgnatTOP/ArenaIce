interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
