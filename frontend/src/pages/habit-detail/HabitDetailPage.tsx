import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@shared/lib/hooks'
import { deleteHabit, fetchHabitById } from '@entities/habit/model/habitsSlice'
import { Button } from '@shared/ui/button'
import { Flame, Pencil, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { HABIT_CATEGORIES } from '@shared/constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { cn } from '@shared/lib/utils'

function getTimeOfDayLabel(timeOfDay?: string) {
  switch (timeOfDay) {
    case 'morning':
      return 'Morning'
    case 'afternoon':
      return 'Afternoon'
    case 'evening':
      return 'Evening'
    default:
      return 'No time'
  }
}

function getCategoryLabel(category?: string) {
  if (!category) return 'None'
  const match = HABIT_CATEGORIES.find((c) => c.id === category)
  return match?.name || category
}

function getStreakLabel(frequency?: string) {
  return frequency === 'weekly' ? 'Streak (weeks)' : 'Streak (days)'
}

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const habits = useAppSelector((state) => state.habits.habits)
  const loading = useAppSelector((state) => state.habits.loading)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const fetchAttemptedRef = useRef<string | null>(null)
  const habit = habits.find((h) => h.id === id)

  useEffect(() => {
    if (!id) return
    if (habit) return
    if (fetchAttemptedRef.current === id) return
    fetchAttemptedRef.current = id
    dispatch(fetchHabitById(id))
  }, [id, habit, dispatch])

  const handleDelete = async () => {
    if (!habit) return
    await dispatch(deleteHabit(habit.id))
    setDeleteConfirmOpen(false)
    navigate('/habits')
  }

  if (loading && !habit) {
    return (
      <div className="p-4">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!id || (fetchAttemptedRef.current === id && !habit && !loading)) {
    return (
      <div className="p-4">
        <p className="text-[15px] text-muted-foreground">This habit may have been deleted.</p>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="p-4">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="p-4">
      <main className="pt-0">
        <div
          className={cn(
            'rounded-[16px] overflow-hidden mb-6',
            'flex flex-col justify-end min-h-[180px]'
          )}
          style={{
            background: `linear-gradient(160deg, ${habit.color} 0%, ${habit.color}dd 50%, ${habit.color}99 100%)`,
          }}
        >
          <div className="p-6 pb-7">
            <div
              className="w-20 h-20 rounded-[20px] flex items-center justify-center text-white font-semibold text-[32px] shadow-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
            >
              {habit.name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 text-[13px] font-medium text-white">
                {habit.frequency === 'weekly' ? 'Weekly' : 'Daily'}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 text-[13px] font-medium text-white">
                {getTimeOfDayLabel(habit.time_of_day)}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 text-[13px] font-medium text-white">
                {habit.type === 'negative' ? 'Negative' : 'Positive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-[12px] bg-secondary/60 border border-border/60 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-[13px] font-medium">{getStreakLabel(habit.frequency)}</span>
            </div>
            <p className="mt-2 text-[28px] font-bold tracking-tight text-foreground">
              {habit.current_streak ?? 0}
            </p>
          </div>
          <div className="rounded-[12px] bg-secondary/60 border border-border/60 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-[13px] font-medium">Category</span>
            </div>
            <p className="mt-2 text-[17px] font-semibold text-foreground truncate">
              {getCategoryLabel(habit.category)}
            </p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="section-header">About</h2>
          <div className="list-group">
            <div className="list-row">
              <span className="text-[15px] text-muted-foreground">Type</span>
              <span className="text-[17px] font-medium">
                {habit.type === 'negative' ? 'Negative' : 'Positive'}
              </span>
            </div>
            <div className="list-row">
              <span className="text-[15px] text-muted-foreground">Frequency</span>
              <span className="text-[17px] font-medium">
                {habit.frequency === 'weekly' ? 'Weekly' : 'Daily'}
              </span>
            </div>
            <div className="list-row">
              <span className="text-[15px] text-muted-foreground">Time of day</span>
              <span className="text-[17px] font-medium">{getTimeOfDayLabel(habit.time_of_day)}</span>
            </div>
            <div className="list-row">
              <span className="text-[15px] text-muted-foreground">Category</span>
              <span className="text-[17px] font-medium">{getCategoryLabel(habit.category)}</span>
            </div>
            {habit.start_date && (
              <div className="list-row">
                <span className="text-[15px] text-muted-foreground">Start date</span>
                <span className="text-[17px] font-medium">
                  {format(new Date(habit.start_date), 'MMM d, yyyy', { locale: enUS })}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="section-header">Actions</h2>
          <div className="list-group">
            <button
              type="button"
              onClick={() => navigate(`/habits/${habit.id}/edit`)}
              className="list-row cursor-pointer active:bg-accent/50 transition-colors text-left w-full"
            >
              <span className="flex items-center gap-3 text-[17px] font-medium flex-1 min-w-0">
                <Pencil className="w-5 h-5 text-muted-foreground shrink-0" />
                Edit habit
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          </div>
        </section>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="w-full min-h-[44px] py-3 text-[17px] font-semibold text-destructive active:opacity-70 rounded-[10px] transition-opacity"
          >
            Delete habit
          </button>
        </div>
      </main>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="rounded-[14px] max-w-[340px] p-6">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold">Delete habit?</DialogTitle>
            <DialogDescription className="text-[15px] text-muted-foreground mt-1 leading-snug">
              Are you sure you want to delete &quot;{habit.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-6 sm:flex-row">
            <Button
              variant="outline"
              className="w-full h-12 rounded-[10px] font-semibold"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full h-12 rounded-[10px] font-semibold"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
