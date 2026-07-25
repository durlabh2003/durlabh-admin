import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, FolderKanban, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  description: string
  role: string
  timeline: string
  outcomes: string[]
  tags: string[]
  liveUrl?: string
}

export default function EditProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'projects')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setProjects(dbData.data as Project[])
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'projects', data: projects }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addProject() {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Project',
      subtitle: 'Short Pitch',
      category: 'AI / SaaS',
      description: 'Detailed description of the product and problem statement.',
      role: 'Lead PM',
      timeline: '2026',
      outcomes: ['Impact metric 1'],
      tags: ['React', 'Supabase']
    }
    const updated = [...projects, newProj]
    setProjects(updated)
    setSelectedIndex(updated.length - 1)
  }

  function removeProject(index: number) {
    const updated = projects.filter((_, i) => i !== index)
    setProjects(updated)
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1))
    }
  }

  function updateSelected(field: keyof Project, val: any) {
    if (projects.length === 0) return
    const updated = [...projects]
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
    setProjects(updated)
  }

  const selectedProj = projects[selectedIndex]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading projects...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <FolderKanban size={14} />
        </div>
        <span className="admin-header-title">Projects</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Manage portfolio case studies & products</span>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} /> {fetchError}
          </div>
        )}

        <div className="array-layout">
          {/* List Sidebar */}
          <div className="array-list-panel">
            <div className="array-list-header">
              <span>Projects ({projects.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addProject} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {projects.map((proj, i) => (
                <button
                  key={proj.id || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{proj.title || 'Untitled Project'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedProj ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedProj.title || 'Edit Project'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removeProject(selectedIndex)}>
                    <Trash2 size={13} /> Delete Project
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input
                      className="form-input"
                      value={selectedProj.title}
                      onChange={e => updateSelected('title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subtitle / Hook</label>
                    <input
                      className="form-input"
                      value={selectedProj.subtitle}
                      onChange={e => updateSelected('subtitle', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      className="form-input"
                      value={selectedProj.category}
                      onChange={e => updateSelected('category', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      className="form-input"
                      value={selectedProj.role}
                      onChange={e => updateSelected('role', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timeline</label>
                    <input
                      className="form-input"
                      value={selectedProj.timeline}
                      onChange={e => updateSelected('timeline', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Live Link / URL</label>
                    <input
                      className="form-input font-mono"
                      value={selectedProj.liveUrl || ''}
                      onChange={e => updateSelected('liveUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={4}
                      value={selectedProj.description}
                      onChange={e => updateSelected('description', e.target.value)}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      className="form-input font-mono"
                      value={(selectedProj.tags || []).join(', ')}
                      onChange={e => updateSelected('tags', e.target.value.split(',').map(t => t.trim()))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No project selected. Add or pick one from the list.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Projects
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Projects</>}
          </button>
        </div>
      </div>
    </>
  )
}
