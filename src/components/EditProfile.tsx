import { useState, useEffect, useCallback } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import type { ProfileSection, SocialLink } from '@/lib/types'
import { UserCircle, Plus, Trash2, Check, AlertCircle, Globe, Save } from 'lucide-react'

const DEFAULT_PROFILE: ProfileSection = {
  name: 'Durlabh Daryani',
  role: 'AI Product Manager',
  tagline: 'Building and shipping real products before my first PM role.',
  location: 'Jaipur, Rajasthan, India',
  coords: 'JPR // 26.9124° N',
  email: 'durlabh.daryani@gmail.com',
  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/durlabhdaryani' },
    { label: 'Twitter',  href: 'https://twitter.com/durlabhdaryani' },
    { label: 'GitHub',   href: 'https://github.com/durlabhdaryani' },
  ],
}

type Toast = { id: number; type: 'success' | 'error'; message: string }

export default function EditProfile() {
  const [profile, setProfile] = useState<ProfileSection>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  function addToast(type: 'success' | 'error', message: string) {
    const id = Date.now()
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await portfolioSupabase
      .from('portfolio_content')
      .select('data')
      .eq('section', 'profile')
      .maybeSingle()

    if (error) {
      setFetchError(error.message)
    } else if (data?.data) {
      setProfile(data.data as ProfileSection)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert(
        { section: 'profile', data: profile },
        { onConflict: 'section' }
      )

    if (error) {
      addToast('error', error.message)
    } else {
      setSaved(true)
      addToast('success', 'Profile saved — portfolio will update on next load.')
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  function updateField<K extends keyof ProfileSection>(key: K, value: ProfileSection[K]) {
    setProfile(p => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function updateSocial(index: number, field: keyof SocialLink, value: string) {
    setProfile(p => ({
      ...p,
      socials: p.socials.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }))
    setSaved(false)
  }

  function addSocial() {
    setProfile(p => ({ ...p, socials: [...p.socials, { label: '', href: '' }] }))
  }

  function removeSocial(index: number) {
    setProfile(p => ({ ...p, socials: p.socials.filter((_, i) => i !== index) }))
  }

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <UserCircle size={14} />
        </div>
        <span className="admin-header-title">Edit Profile</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Updates the live portfolio's hero and about section</span>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} />
            Failed to load profile data: {fetchError}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
            <div className="loading-spinner" />
            Loading profile…
          </div>
        ) : (
          <>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div className="card-header-icon">
                  <UserCircle size={15} />
                </div>
                <div>
                  <div className="card-title">Basic Information</div>
                  <div className="card-desc">Name, role, tagline and location shown in the Hero section</div>
                </div>
              </div>
              <div className="card-body">
                <div className="profile-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-name">Full Name</label>
                    <input
                      id="profile-name"
                      className="form-input"
                      value={profile.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-role">Role / Title</label>
                    <input
                      id="profile-role"
                      className="form-input"
                      value={profile.role}
                      onChange={e => updateField('role', e.target.value)}
                      placeholder="AI Product Manager"
                    />
                  </div>
                  <div className="form-group profile-grid-full" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="profile-tagline">Tagline</label>
                    <textarea
                      id="profile-tagline"
                      className="form-input form-textarea"
                      value={profile.tagline}
                      onChange={e => updateField('tagline', e.target.value)}
                      placeholder="One-liner shown below your name in the hero…"
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-location">Location</label>
                    <input
                      id="profile-location"
                      className="form-input"
                      value={profile.location}
                      onChange={e => updateField('location', e.target.value)}
                      placeholder="City, State, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-coords">Coordinates Label</label>
                    <input
                      id="profile-coords"
                      className="form-input font-mono"
                      value={profile.coords}
                      onChange={e => updateField('coords', e.target.value)}
                      placeholder="JPR // 26.9124° N"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="profile-email">Contact Email</label>
                    <input
                      id="profile-email"
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div className="card-header-icon">
                  <Globe size={15} />
                </div>
                <div>
                  <div className="card-title">Social Links</div>
                  <div className="card-desc">Shown in the hero CTA row and footer</div>
                </div>
                <button
                  id="add-social-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={addSocial}
                  style={{ marginLeft: 'auto' }}
                >
                  <Plus size={13} />
                  Add Link
                </button>
              </div>
              <div className="card-body">
                {profile.socials.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No social links yet. Add one above.</p>
                ) : (
                  <div className="socials-list">
                    {profile.socials.map((social, i) => (
                      <div key={i} className="social-row">
                        <input
                          className="form-input"
                          value={social.label}
                          onChange={e => updateSocial(i, 'label', e.target.value)}
                          placeholder="Label (e.g. LinkedIn)"
                          aria-label={`Social ${i + 1} label`}
                          style={{ fontSize: 13 }}
                        />
                        <input
                          className="form-input font-mono"
                          value={social.href}
                          onChange={e => updateSocial(i, 'href', e.target.value)}
                          placeholder="https://..."
                          aria-label={`Social ${i + 1} URL`}
                          style={{ fontSize: 12 }}
                        />
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeSocial(i)}
                          aria-label={`Remove ${social.label || 'link'}`}
                          style={{ color: 'var(--danger)', flexShrink: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Bar */}
            <div className="save-bar" style={{ background: 'transparent', borderTop: 'none', justifyContent: 'flex-end', paddingInline: 0 }}>
              {saved && (
                <div className="save-status">
                  <Check size={14} />
                  Saved successfully
                </div>
              )}
              <button
                id="save-profile-btn"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ minWidth: 120 }}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-dot" />
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
