import { LucideIcon, Home, List, BarChart3, Settings } from 'lucide-react'

export interface NavItem {
  path: string
  icon: LucideIcon
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: Home, label: 'Today' },
  { path: '/habits', icon: List, label: 'Habits' },
  { path: '/insights', icon: BarChart3, label: 'Insights' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]
