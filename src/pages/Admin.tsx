import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'
import EditProfile from '@/components/EditProfile'
import ContactResponses from '@/components/ContactResponses'

export default function Admin() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="admin-layout">
      <Sidebar user={user} unreadCount={unreadCount} />
      <main className="admin-main">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<EditProfile />} />
          <Route
            path="contacts"
            element={<ContactResponses onUnreadChange={setUnreadCount} />}
          />
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  )
}
