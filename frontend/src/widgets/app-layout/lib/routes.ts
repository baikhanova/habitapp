import type { RootState } from '@app/store'

export interface BreadcrumbItem {
  label: string
  path?: string
}

export function getPageTitle(
  pathname: string,
  params: Record<string, string | undefined>,
  state: RootState
): string {
  if (pathname === '/') return 'Today'
  if (pathname === '/habits') return 'Habits'
  if (pathname === '/habits/create') return 'Create Habit'
  if (pathname === '/insights') return 'Insights'
  if (pathname === '/settings') return 'Settings'
  const habitMatch = pathname.match(/^\/habits\/([^/]+)$/)
  if (habitMatch) {
    const habit = state.habits.habits.find((h) => h.id === habitMatch[1])
    return habit?.name ?? 'Habit'
  }
  const editMatch = pathname.match(/^\/habits\/([^/]+)\/edit$/)
  if (editMatch) {
    const habit = state.habits.habits.find((h) => h.id === editMatch[1])
    return habit ? `Edit ${habit.name}` : 'Edit Habit'
  }
  return 'Habit'
}

export function getBreadcrumbs(
  pathname: string,
  params: Record<string, string | undefined>,
  state: RootState
): BreadcrumbItem[] {
  if (pathname === '/') return []
  if (pathname === '/habits') return []
  if (pathname === '/insights') return []
  if (pathname === '/settings') return []
  if (pathname === '/habits/create') {
    return [{ label: 'Habits', path: '/habits' }, { label: 'Create' }]
  }
  const habitMatch = pathname.match(/^\/habits\/([^/]+)$/)
  if (habitMatch) {
    const habit = state.habits.habits.find((h) => h.id === habitMatch[1])
    return [
      { label: 'Habits', path: '/habits' },
      { label: habit?.name ?? 'Habit', path: `/habits/${habitMatch[1]}` },
    ]
  }
  const editMatch = pathname.match(/^\/habits\/([^/]+)\/edit$/)
  if (editMatch) {
    const habit = state.habits.habits.find((h) => h.id === editMatch[1])
    return [
      { label: 'Habits', path: '/habits' },
      { label: habit?.name ?? 'Habit', path: `/habits/${editMatch[1]}` },
      { label: 'Edit' },
    ]
  }
  return []
}

export function getBackLink(
  pathname: string,
  params: Record<string, string | undefined>
): string | null {
  if (pathname === '/habits/create') return '/habits'
  const habitMatch = pathname.match(/^\/habits\/([^/]+)$/)
  if (habitMatch) return '/habits'
  const editMatch = pathname.match(/^\/habits\/([^/]+)\/edit$/)
  if (editMatch) return `/habits/${editMatch[1]}`
  return null
}
