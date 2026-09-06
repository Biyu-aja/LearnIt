/**
 * Folder: src/constants/
 * Description: Stores constants, router configurations, menu routes, and static route mappings.
 * This file: router.tsx (Defines routes and application navigation structure).
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/ui/layout'
import { AppRoutes } from './listed'
import DashboardPage from '../pages/Dashboard'
import ChatPage from '../pages/Chat'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to={`/${AppRoutes.Dashboard}`} replace />,
      },
      {
        path: AppRoutes.Dashboard,
        element: <DashboardPage />,
      },
      {
        path: AppRoutes.Chat,
        element: <ChatPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

