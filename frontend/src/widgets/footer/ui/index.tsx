import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">ArenaIce</h3>
            <p className="text-muted-foreground mb-4">
              Современная ледовая арена для спорта и развлечений
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Главная</Link></li>
              <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">События</Link></li>
              <li><Link to="/sections" className="text-muted-foreground hover:text-primary transition-colors">Секции</Link></li>
              <li><Link to="/booking" className="text-muted-foreground hover:text-primary transition-colors">Аренда льда</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+7 (495) 123-45-67</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@arenaice.ru</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1" />
                <span>г. Москва, ул. Ледовая, д. 1</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Режим работы</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Пн-Пт: 08:00 - 22:00</li>
              <li>Сб-Вс: 09:00 - 21:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 ArenaIce. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
