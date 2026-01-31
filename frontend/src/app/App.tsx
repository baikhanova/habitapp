import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@shared/lib/hooks'
import { LoginForm } from '@features/auth/ui/LoginForm'
import { RegisterForm } from '@features/auth/ui/RegisterForm'
import { TodayScreen } from '@widgets/today-screen/ui/TodayScreen'
import { HabitsList } from '@widgets/habits-list/ui/HabitsList'
import { InsightsDashboard } from '@widgets/insights-dashboard/ui/InsightsDashboard'
import { SettingsScreen } from '@widgets/settings/ui/SettingsScreen'
import { BottomNavigation } from '@widgets/bottom-navigation/ui/BottomNavigation'
import { AppLayout } from '@widgets/app-layout/ui'
import { CreateHabitPage } from '@pages/create-habit/CreateHabitPage'
import { HabitDetailPage } from '@pages/habit-detail/HabitDetailPage'
import { HabitEditPage } from '@pages/habit-edit/HabitEditPage'
import { FloatingActionButton } from '@widgets/floating-action-button/ui/FloatingActionButton'

function AppContent() {
  const location = useLocation()
  const path = location.pathname
  const shouldShowBottomNav =
    path !== '/habits/create' &&
    !/^\/habits\/[^/]+$/.test(path) &&
    !/^\/habits\/[^/]+\/edit$/.test(path)

  return (
    <>
      <AppLayout>
        <div className="p-4 md:p-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-6">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <TodayScreen />
                </div>
              }
            />
            <Route
              path="/habits"
              element={
                <div className="space-y-4">
                  <HabitsList />
                  <FloatingActionButton />
                </div>
              }
            />
            <Route path="/habits/create" element={<CreateHabitPage />} />
            <Route path="/habits/:id" element={<HabitDetailPage />} />
            <Route path="/habits/:id/edit" element={<HabitEditPage />} />
            <Route
              path="/insights"
              element={
                <div>
                  <InsightsDashboard />
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div>
                  <SettingsScreen />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AppLayout>
      {shouldShowBottomNav && <BottomNavigation />}
    </>
  )
}

function App() {
  const isAuthenticated = useAppSelector((state) => !!state.user.token)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return <AppContent />
}

export default App
