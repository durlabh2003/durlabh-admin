import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, FileText, AlertCircle, ExternalLink } from 'lucide-react'

interface CaseStudy {
  slug: string
  name: string
  tag: string
  status: 'shipped' | 'concept'
  notionEmbed?: string
  problem?: string
  research?: string
  jtbd?: string
  prd?: string
  metrics?: string[]
  lessons?: string
}

export default function EditCaseStudies() {
  const [studies, setStudies] = useState<CaseStudy[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCaseStudies() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'caseStudies')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setStudies(dbData.data as CaseStudy[])
      }
      setLoading(false)
    }
    fetchCaseStudies()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'caseStudies', data: studies }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addStudy() {
    const newStudy: CaseStudy = {
      slug: `case-study-${Date.now()}`,
      name: 'New Case Study',
      tag: 'AI / Product Strategy',
      status: 'shipped',
      notionEmbed: '<iframe src="https://well-yellowhorn-923.notion.site/ebd//3af31ee2baa080218671dbe18a487007" width="100%" height="600" frameborder="0" allowfullscreen />',
      problem: 'Describe the core problem statement...',
      research: 'Summary of user research...',
      jtbd: 'When [situation], I want to [motivation], so I can [outcome].',
      prd: 'Key specs and features...',
      metrics: ['Metric 1: High adoption'],
      lessons: 'Key takeaways...'
    }
    const updated = [...studies, newStudy]
    setStudies(updated)
    setSelectedIndex(updated.length - 1)
  }

  function removeStudy(index: number) {
    const updated = studies.filter((_, i) => i !== index)
    setStudies(updated)
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1))
    }
  }

  function updateSelected(field: keyof CaseStudy, val: any) {
    if (studies.length === 0) return
    const updated = [...studies]
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
    setStudies(updated)
  }

  function handleMetricChange(metricIdx: number, val: string) {
    if (!selectedStudy) return
    const updatedMetrics = [...(selectedStudy.metrics || [])]
    updatedMetrics[metricIdx] = val
    updateSelected('metrics', updatedMetrics)
  }

  function addMetric() {
    if (!selectedStudy) return
    const updatedMetrics = [...(selectedStudy.metrics || []), '']
    updateSelected('metrics', updatedMetrics)
  }

  function removeMetric(metricIdx: number) {
    if (!selectedStudy) return
    const updatedMetrics = (selectedStudy.metrics || []).filter((_, i) => i !== metricIdx)
    updateSelected('metrics', updatedMetrics)
  }

  const selectedStudy = studies[selectedIndex]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading case studies...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <FileText size={14} />
        </div>
        <span className="admin-header-title">Case Studies & Notion Embeds</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Manage deep-dive case studies and embedded Notion documents</span>
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
              <span>Case Studies ({studies.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addStudy} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {studies.map((cs, i) => (
                <button
                  key={cs.slug || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{cs.name || 'Untitled Case Study'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedStudy ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedStudy.name || 'Edit Case Study'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removeStudy(selectedIndex)}>
                    <Trash2 size={13} /> Delete Case Study
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Case Study Title</label>
                    <input
                      className="form-input"
                      value={selectedStudy.name || ''}
                      onChange={e => updateSelected('name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">URL Slug</label>
                    <input
                      className="form-input font-mono"
                      value={selectedStudy.slug || ''}
                      onChange={e => updateSelected('slug', e.target.value)}
                      placeholder="e.g. kartify"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Tag</label>
                    <input
                      className="form-input"
                      value={selectedStudy.tag || ''}
                      onChange={e => updateSelected('tag', e.target.value)}
                      placeholder="e.g. AI Shopping Assistant"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={selectedStudy.status || 'shipped'}
                      onChange={e => updateSelected('status', e.target.value)}
                    >
                      <option value="shipped">Shipped</option>
                      <option value="concept">Concept</option>
                    </select>
                  </div>

                  {/* Notion Embed Code */}
                  <div className="form-group form-group-full">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Notion Embed HTML (&lt;iframe src="https://...notion.site/..." ... /&gt;)</span>
                    </label>
                    <textarea
                      className="form-input form-textarea font-mono"
                      rows={3}
                      value={selectedStudy.notionEmbed || ''}
                      onChange={e => updateSelected('notionEmbed', e.target.value)}
                      placeholder='<iframe src="https://well-yellowhorn-923.notion.site/ebd//..." width="100%" height="600" frameborder="0" allowfullscreen />'
                      style={{ fontSize: 12 }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Paste your Notion embed code here. When present, the live interactive Notion document will render directly inside the portfolio case study!
                    </p>
                  </div>

                  {/* Notion Live Preview */}
                  {selectedStudy.notionEmbed && (
                    <div className="form-group form-group-full" style={{ marginTop: 8 }}>
                      <label className="form-label">Live Notion Document Preview</label>
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: 12,
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          overflow: 'hidden',
                          height: 520
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedStudy.notionEmbed }}
                      />
                    </div>
                  )}

                  <div className="form-group form-group-full">
                    <label className="form-label">Problem Statement (Fallback text)</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedStudy.problem || ''}
                      onChange={e => updateSelected('problem', e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">User Research & Discovery</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedStudy.research || ''}
                      onChange={e => updateSelected('research', e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Jobs-To-Be-Done (JTBD)</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedStudy.jtbd || ''}
                      onChange={e => updateSelected('jtbd', e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">PRD & Solution Overview</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedStudy.prd || ''}
                      onChange={e => updateSelected('prd', e.target.value)}
                    />
                  </div>

                  {/* Impact Metrics */}
                  <div className="form-group form-group-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Impact Metrics</label>
                      <button className="btn btn-secondary btn-sm" onClick={addMetric}>
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    {(selectedStudy.metrics || []).map((metric, mIdx) => (
                      <div key={mIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          className="form-input"
                          value={metric}
                          onChange={e => handleMetricChange(mIdx, e.target.value)}
                          placeholder={`Metric ${mIdx + 1}`}
                        />
                        <button
                          className="btn btn-ghost btn-icon text-danger"
                          onClick={() => removeMetric(mIdx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Key Lessons & Framework Applications</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedStudy.lessons || ''}
                      onChange={e => updateSelected('lessons', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No case study selected. Add or select one from the list.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Case Studies
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Case Studies</>}
          </button>
        </div>
      </div>
    </>
  )
}
