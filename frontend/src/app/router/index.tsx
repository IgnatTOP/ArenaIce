import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../../pages/home'
import { EventsPage } from '../../pages/events'
import { EventDetailPage } from '../../pages/event-detail'
import { SectionsPage } from '../../pages/sections'
import { BookingPage } from '../../pages/booking'
import { ProfilePage } from '../../pages/profile'
import { AdminPage } from '../../pages/admin'
import { LoginPage } from '../../pages/login'
import { RegisterPage } from '../../pages/register'
import { Header } from '../../widgets/header/ui'
import { Footer } from '../../widgets/footer/ui'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/sections" element={<SectionsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
