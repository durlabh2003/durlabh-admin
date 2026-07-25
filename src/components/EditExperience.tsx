import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, Briefcase, AlertCircle } from 'lucide-react'

interface Experience {
  id: string
  company: string
  role: string
  period: string
  location: string
  description: string
  highlights: string[]
}

export default function EditExperience() {
  const [items, setItems] = useState<Experience[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExp() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'experience')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setItems(dbData.data as Experience[])
      }
      setLoading(false)
    }
    fetchExp()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'experience', data: items }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addItem() {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: 'Company Name',
      role: 'Role Title',
      period: '2025 - Present',
      location: 'Remote',
      description: 'Role overview...',
      highlights: ['Key achievement 1']
    }
    const updated = [...items, newExp]
    setItems(updated)
    setSelectedIndex(updated.length - 1)
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1))
    }
  }

  function updateSelected(field: keyof Experience, val: any) {
    if (items.length === 0) return
    const updated = [...items]
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
    setItems(updated)
  }

  const selectedItem = items[selectedIndex]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading experience data...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <Briefcase size={14} />
        </div>
        <span className="admin-header-title">Experience</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Work history, roles & career progression</span>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} /> {fetchError}
          </div>
        )}

        <div className="array-layout">
          {/* Sidebar */}
          <div className="array-list-panel">
            <div className="array-list-header">
              <span>Roles ({items.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {items.map((exp, i) => (
                <button
                  key={exp.id || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{exp.company || 'Untitled Role'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedItem ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedItem.company || 'Edit Role'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removeItem(selectedIndex)}>
                    <Trash2 size={13} /> Delete Role
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      className="form-input"
                      value={selectedItem.company}
                      onChange={e => updateSelected('company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Title</label>
                    <input
                      className="form-input"
                      value={selectedItem.role}
                      onChange={e => updateSelected('role', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period (e.g. 2023 - Present)</label>
                    <input
                      className="form-input"
                      value={selectedItem.period}
                      onChange={e => updateSelected('period', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      value={selectedItem.location}
                      onChange={e => updateSelected('location', e.target.value)}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Overview Description</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedItem.description}
                      onChange={e => updateSelected('description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No item selected. Add or pick one from the left.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Experience
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Experience</>}
          </button>
        </div>
      </div>
    </>
  )
}
