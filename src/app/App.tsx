import { Routes } from './routes'
import { AuthProvider } from './providers/AuthProvider'

export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}
