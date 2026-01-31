import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { logout } from '@entities/user/model/userSlice'
import { setTheme } from '@shared/lib/uiSlice'
import { Button } from '@shared/ui/button'
import { Switch } from '@shared/ui/switch'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@shared/lib/utils'

export function SettingsScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useAppSelector((state) => state.ui.theme)
  const user = useAppSelector((state) => state.user.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div
      className={cn(
        'min-h-full overflow-y-auto',
        'pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-6'
      )}
    >
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="section-header">Appearance</h2>
          <div className="list-group">
            <div className="list-row">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-[17px] font-medium">Dark mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => dispatch(setTheme(checked ? 'dark' : 'light'))}
              />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="section-header">Account</h2>
          <div className="list-group">
            {user && (
              <div className="list-row">
                <span className="text-muted-foreground text-[15px]">Email</span>
                <span className="text-[17px] font-medium truncate max-w-[200px]">{user.email}</span>
              </div>
            )}
          </div>
          <div className="hidden md:block pt-2">
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full h-12 text-[17px] font-semibold rounded-[10px]"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign out
            </Button>
          </div>
        </section>
      </div>

      <div
        className={cn(
          'fixed left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl px-4 pt-3 md:hidden'
        )}
        style={{
          bottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full h-12 text-[17px] font-semibold rounded-[10px]"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
