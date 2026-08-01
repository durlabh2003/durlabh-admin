import { useNavigate, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { setAdminFlag } from '@/hooks/useAuth'
import { UserCircle, Mail, LogOut, UserCheck, FolderKanban, Briefcase, Code2, BookOpen, Linkedin, FileText } from 'lucide-react'

interface SidebarProps {
  user: User
  unreadCount: number
}

export default function Sidebar({ user, unreadCount }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname.includes(path)

  async function handleLogout() {
    setAdminFlag(false)
    await supabase.auth.signOut()
    navigate('/login')
  }

  const emailInitial = user.email?.[0].toUpperCase() ?? 'A'

  const navItems = [
    {
      id: 'profile',
      label: 'Hero & Profile',
      icon: <UserCircle size={16} />,
      path: '/admin/profile',
    },
    {
      id: 'about',
      label: 'About Section',
      icon: <UserCheck size={16} />,
      path: '/admin/about',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban size={16} />,
      path: '/admin/projects',
    },
    {
      id: 'case-studies',
      label: 'Case Studies',
      icon: <FileText size={16} />,
      path: '/admin/case-studies',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: <Briefcase size={16} />,
      path: '/admin/experience',
    },
    {
      id: 'skills',
      label: 'Skills & Tools',
      icon: <Code2 size={16} />,
      path: '/admin/skills',
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: <BookOpen size={16} />,
      path: '/admin/articles',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Posts',
      icon: <Linkedin size={16} />,
      path: '/admin/linkedin',
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
