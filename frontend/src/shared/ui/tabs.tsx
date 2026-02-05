import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'default' | 'pills'
}

export const Tabs = ({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) => {
  return (
    <div className={`flex gap-1 ${variant === 'pills' ? 'bg-muted p-1 rounded-lg' : 'border-b'}`}>
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              variant === 'pills'
                ? isActive
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
                : isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="font-medium">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
            {isActive && variant === 'default' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
