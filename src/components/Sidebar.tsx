import { useNavigate, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserCircle, Mail, LogOut } from 'lucide-react'

interface SidebarProps {
  user: User
  unreadCount: number
}

export default function Sidebar({ user, unreadCount }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname.includes(path)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const emailInitial = user.email?.[0].toUpperCase() ?? 'A'

  const navItems = [
    {
      id: 'profile',
      label: 'Edit Profile',
      icon: <UserCircle size={16} />,
      path: '/admin/profile',
    },
    {
      id: 'contacts',
      label: 'Contact Responses',
      icon: <Mail size={16} />,
      path: '/admin/contacts',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ]

  return (
    <nav className="sidebar" aria-label="Admin navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">DD</div>
        <span className="sidebar-brand-text">Portfolio Admin</span>
      </div>

      <span className="sidebar-section-label">Content</span>

      {navItems.map(item => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge !== undefined && (
            <span className="sidebar-badge">{item.badge}</span>
          )}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{emailInitial}</div>
          <span className="sidebar-user-email" title={user.email}>
            {user.email}
          </span>
        </div>
        <button
          id="logout-btn"
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label="Sign out"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
