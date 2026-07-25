import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContactSubmission } from '@/lib/types'
import {
  Mail,
  X,
  Trash2,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Inbox,
} from 'lucide-react'

interface ContactResponsesProps {
  onUnreadChange: (count: number) => void
}

type Filter = 'all' | 'unread' | 'read'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ContactResponses({ onUnreadChange }: ContactResponsesProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<ContactSubmission | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setFetchError(error.message)
    } else {
      const rows = (data ?? []) as ContactSubmission[]
      setSubmissions(rows)
      onUnreadChange(rows.filter(r => !r.read).length)
    }
    setLoading(false)
  }, [onUnreadChange])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const filtered = submissions.filter(s => {
    if (filter === 'unread') return !s.read
    if (filter === 'read') return s.read
    return true
  })

  async function markRead(id: string, read: boolean) {
    setActionLoading(id)
    const { error } = await supabase
      .from('contact_submissions')
      .update({ read })
      .eq('id', id)

    if (!error) {
      setSubmissions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, read } : s)
        onUnreadChange(updated.filter(r => !r.read).length)
        return updated
      })
      if (selected?.id === id) setSelected(s => s ? { ...s, read } : s)
    }
    setActionLoading(null)
  }

  async function deleteSubmission(id: string) {
    setActionLoading(id)
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (!error) {
      setSubmissions(prev => {
        const updated = prev.filter(s => s.id !== id)
        onUnreadChange(updated.filter(r => !r.read).length)
        return updated
      })
      if (selected?.id === id) setSelected(null)
    }
    setActionLoading(null)
  }

  function openSubmission(submission: ContactSubmission) {
    setSelected(submission)
    // Auto-mark as read when opened
    if (!submission.read) markRead(submission.id, true)
  }

  const unreadCount = submissions.filter(s => !s.read).length

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <Mail size={14} />
        </div>
        <span className="admin-header-title">Contact Responses</span>
        {unreadCount > 0 && (
          <>
            <span className="admin-header-divider">·</span>
            <span className="admin-header-subtitle" style={{ color: 'var(--accent)' }}>
              {unreadCount} unread
            </span>
          </>
        )}
        <div className="admin-header-actions">
          <button
            id="refresh-contacts-btn"
            className="btn btn-ghost btn-sm"
            onClick={fetchSubmissions}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} />
            {fetchError.includes('does not exist')
              ? 'Table not found. Run the SQL migration in supabase/contact_submissions.sql first.'
              : fetchError}
          </div>
        )}

        {/* Filters */}
        <div className="contact-filters">
          {(['all', 'unread', 'read'] as Filter[]).map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              {f === 'all' && ` (${submissions.length})`}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: '60px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <div className="loading-spinner" />
              Loading submissions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Inbox size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3>No {filter !== 'all' ? filter : ''} messages</h3>
              <p>
                {filter === 'unread'
                  ? 'All caught up! No unread submissions.'
                  : 'Contact form submissions from your portfolio will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="submissions-header">
                <span />
                <span>Sender</span>
                <span>Preview</span>
                <span>Date</span>
                <span />
              </div>
              <div className="submissions-list">
                {filtered.map(sub => (
                  <div
                    key={sub.id}
                    id={`submission-${sub.id}`}
                    className={`submission-row${!sub.read ? ' unread' : ''}`}
                    onClick={() => openSubmission(sub)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openSubmission(sub)}
                    aria-label={`Message from ${sub.name}`}
                  >
                    <div className={`submission-unread-dot${sub.read ? ' read' : ''}`} />
                    <div>
                      <div className="submission-name">{sub.name}</div>
                      <div className="submission-email">{sub.email}</div>
                    </div>
                    <div className="submission-excerpt">{sub.message}</div>
                    <div className="submission-date">{formatDate(sub.created_at)}</div>
                    <div className="submission-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => markRead(sub.id, !sub.read)}
                        disabled={actionLoading === sub.id}
                        title={sub.read ? 'Mark as unread' : 'Mark as read'}
                        aria-label={sub.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckCheck size={13} style={{ color: sub.read ? 'var(--text-muted)' : 'var(--accent)' }} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => deleteSubmission(sub.id)}
                        disabled={actionLoading === sub.id}
                        title="Delete"
                        aria-label="Delete submission"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-label={`Message from ${selected.name}`}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {selected.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selected.email}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <span className={`tag tag-${selected.read ? 'read' : 'unread'}`}>
                  {selected.read ? 'Read' : 'Unread'}
                </span>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-meta">
                <div className="modal-field">
                  <span className="modal-field-label">Received</span>
                  <span className="modal-field-value">{formatDate(selected.created_at)}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Email</span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="modal-field-value text-accent"
                    style={{ textDecoration: 'none' }}
                  >
                    {selected.email}
                  </a>
                </div>
              </div>

              <div className="modal-field" style={{ marginBottom: 12 }}>
                <span className="modal-field-label">Message</span>
              </div>
              <div className="modal-message">{selected.message}</div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteSubmission(selected.id)}
                disabled={actionLoading === selected.id}
              >
                <Trash2 size={13} />
                Delete
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => markRead(selected.id, !selected.read)}
                  disabled={actionLoading === selected.id}
                >
                  <CheckCheck size={13} />
                  {selected.read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <a
                  href={`mailto:${selected.email}?subject=Re: Your message`}
                  className="btn btn-primary btn-sm"
                >
                  <Mail size={13} />
                  Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
