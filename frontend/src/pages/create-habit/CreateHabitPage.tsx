import { useNavigate } from 'react-router-dom'
import { CreateHabitForm } from '@features/create-habit/ui/CreateHabitForm'
import { Button } from '@shared/ui/button'
import { useToast } from '@shared/ui/toast'

export function CreateHabitPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast('Habit created successfully!', 'success')
    navigate('/habits')
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="p-4">
        <CreateHabitForm onSuccess={handleSuccess} />
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="p-4 pt-3">
          <Button
            type="submit"
            form="create-habit-form"
            size="lg"
            className="w-full font-semibold"
          >
            Create habit
          </Button>
        </div>
      </div>
    </div>
  )
}
