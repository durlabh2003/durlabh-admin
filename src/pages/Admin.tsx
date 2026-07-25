import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import EditProfile from '@/components/EditProfile'
import EditAbout from '@/components/EditAbout'
import EditProjects from '@/components/EditProjects'
import EditExperience from '@/components/EditExperience'
import EditSkills from '@/components/EditSkills'
import EditArticles from '@/components/EditArticles'
import EditLinkedInPosts from '@/components/EditLinkedInPosts'
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
          <Route path="about" element={<EditAbout />} />
          <Route path="projects" element={<EditProjects />} />
          <Route path="experience" element={<EditExperience />} />
          <Route path="skills" element={<EditSkills />} />
          <Route path="articles" element={<EditArticles />} />
          <Route path="linkedin" element={<EditLinkedInPosts />} />
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
