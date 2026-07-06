import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { LoginScreen } from '@/app/screens/LoginScreen'
import { SignUpScreen } from '@/app/screens/SignUpScreen'
import { ResetPasswordScreen } from '@/app/screens/ResetPasswordScreen'
import { MenuScreen } from '@/app/screens/MenuScreen'
import { SettingsScreen } from '@/app/screens/SettingsScreen'
import { RankingScreen } from '@/app/screens/RankingScreen'
import { GameSetupScreen } from '@/app/screens/GameSetupScreen'
import { GameScreen } from '@/app/screens/GameScreen'

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/cadastro" element={<SignUpScreen />} />
      <Route path="/recuperar" element={<ResetPasswordScreen />} />

      <Route
        path="/"
        element={
          <AppLayout>
            <MenuScreen />
          </AppLayout>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <AppLayout>
            <SettingsScreen />
          </AppLayout>
        }
      />
      <Route
        path="/ranking"
        element={
          <AppLayout>
            <RankingScreen />
          </AppLayout>
        }
      />
      <Route
        path="/jogar"
        element={
          <AppLayout>
            <GameSetupScreen />
          </AppLayout>
        }
      />
      <Route path="/jogo" element={<GameScreen />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  )
}
