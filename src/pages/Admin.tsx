import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import EditProfile from '@/components/EditProfile'
import ContactResponses from '@/components/ContactResponses'

interface AdminProps {
  user: User
}

export default function Admin({ user }: AdminProps) {
  const [unreadCount, setUnreadCount] = useState(0)

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
