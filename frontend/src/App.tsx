import { QueryProvider } from './app/providers/QueryProvider'
import { AppRouter } from './app/router/index'
import { Toast } from './shared/ui/toast'
import './app/styles/index.css'

function App() {
  return (
    <QueryProvider>
      <AppRouter />
      <Toast />
    </QueryProvider>
  )
}

export default App
