import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import Admin from '@/pages/Admin'

function ProtectedRoute({ children }: { children: (user: User) => React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Verifying access…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  // user may briefly be null while session loads — wait for it
  if (!user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading session…</p>
      </div>
    )
  }

  return <>{children(user)}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              {(user) => <Admin user={user} />}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
