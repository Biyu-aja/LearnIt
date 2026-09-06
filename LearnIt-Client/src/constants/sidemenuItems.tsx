/**
 * Folder: src/constants/
 * Description: Stores constants, router configurations, menu routes, and static route mappings.
 * This file: sidemenuItems.tsx (Defines the side menu navigation items and Lucide icons used).
 */

import { LayoutDashboard } from 'lucide-react'
import { AppRoutes } from './listed'

export const sidemenuItems = [
  {
    name: 'Dashboard',
    href: AppRoutes.Dashboard,
    icons: <LayoutDashboard className="w-4.5 h-4.5" />,
  },
]
