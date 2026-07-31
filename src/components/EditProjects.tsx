import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, FolderKanban, AlertCircle } from 'lucide-react'

interface Project {
  id?: string
  index?: string
  name: string
  title?: string
  subtitle?: string
  kicker?: string
  category?: string
  description: string
  longDescription?: string
  role: string
  timeline?: string
  status?: string
  stack?: string[]
  tags?: string[]
  liveUrl?: string
  prdUrl?: string
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
        .eq('section', 'featuredProducts')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        const rawList = dbData.data as any[]
        const normalized = rawList.map(item => ({
          ...item,
          name: item.name || item.title || 'Untitled',
          title: item.title || item.name || 'Untitled',
          tags: item.tags || item.stack || [],
          stack: item.stack || item.tags || []
        }))
        setProjects(normalized)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    
    // Save to both 'featuredProducts' and 'projects' keys to ensure compatibility with site
    const payload = projects.map(p => ({
      ...p,
      name: p.name || p.title || '',
      title: p.title || p.name || '',
      stack: p.stack || p.tags || [],
      tags: p.tags || p.stack || []
    }))

    const { error: err1 } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'featuredProducts', data: payload }, { onConflict: 'section' })

    const { error: err2 } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'projects', data: payload }, { onConflict: 'section' })

    if (!err1 && !err2) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${err1?.message || err2?.message}`)
    }
    setSaving(false)
  }

  function addProject() {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      index: `0${projects.length + 1}`,
      name: 'New Product',
      title: 'New Product',
      subtitle: 'Short Pitch',
      kicker: 'SAAS',
      category: 'AI / SaaS',
      description: 'Conversational AI product assistant...',
      longDescription: 'Detailed problem framing and solution details...',
      role: 'Lead PM',
      timeline: '2026',
      status: 'shipped',
      stack: ['React', 'Supabase'],
      tags: ['React', 'Supabase'],
      liveUrl: 'https://example.com',
      prdUrl: 'https://example.com/prd'
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
    const current = { ...updated[selectedIndex], [field]: val }
    if (field === 'name') current.title = val
    if (field === 'title') current.name = val
    if (field === 'stack') current.tags = val
    if (field === 'tags') current.stack = val
    updated[selectedIndex] = current
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
        <span className="admin-header-title">Featured Products</span>
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
              <span>Products ({projects.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addProject} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {projects.map((proj, i) => (
                <button
                  key={proj.id || proj.name || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{proj.name || proj.title || 'Untitled Product'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedProj ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedProj.name || 'Edit Product'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removeProject(selectedIndex)}>
                    <Trash2 size={13} /> Delete Product
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      className="form-input"
                      value={selectedProj.name || selectedProj.title || ''}
                      onChange={e => updateSelected('name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kicker / Category Tag</label>
                    <input
                      className="form-input font-mono"
                      value={selectedProj.kicker || selectedProj.category || ''}
                      onChange={e => updateSelected('kicker', e.target.value)}
                      placeholder="e.g. AI SHOPPING"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      className="form-input"
                      value={selectedProj.role || ''}
                      onChange={e => updateSelected('role', e.target.value)}
                      placeholder="e.g. PM · UX · AI Workflow"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={selectedProj.status || 'shipped'}
                      onChange={e => updateSelected('status', e.target.value)}
                    >
                      <option value="shipped">Shipped</option>
                      <option value="concept">Concept</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Live Product URL</label>
                    <input
                      className="form-input font-mono"
                      value={selectedProj.liveUrl || ''}
                      onChange={e => updateSelected('liveUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PRD Document URL</label>
                    <input
                      className="form-input font-mono"
                      value={selectedProj.prdUrl || ''}
                      onChange={e => updateSelected('prdUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Short Card Description</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={2}
                      value={selectedProj.description || ''}
                      onChange={e => updateSelected('description', e.target.value)}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Detailed Modal Description</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedProj.longDescription || ''}
                      onChange={e => updateSelected('longDescription', e.target.value)}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Tech Stack (comma separated)</label>
                    <input
                      className="form-input font-mono"
                      value={(selectedProj.stack || selectedProj.tags || []).join(', ')}
                      onChange={e => updateSelected('stack', e.target.value.split(',').map(t => t.trim()))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No product selected. Add or pick one from the list.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Products
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Products</>}
          </button>
        </div>
      </div>
    </>
  )
}
