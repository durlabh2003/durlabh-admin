import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, UserCheck, BarChart3, AlertCircle } from 'lucide-react'

interface AboutData {
  paragraphs: string[]
  stats: { label: string; value: number; suffix: string }[]
}

const DEFAULT_ABOUT: AboutData = {
  paragraphs: [
    "I've built and shipped four products end-to-end — Kartify, CafeOS, Tapinfi and FinMate — before ever holding a Product Manager title.",
    "My BA and QA background is not a side story — it's the same PM work under a different job title.",
    "I want to be one of the leading AI Product Managers of the next decade."
  ],
  stats: [
    { label: 'Products Shipped', value: 4, suffix: '' },
    { label: 'Case Studies', value: 6, suffix: '' },
    { label: 'Frameworks Practiced', value: 5, suffix: '+' },
    { label: 'AI Experiments', value: 20, suffix: '+' }
  ]
}

export default function EditAbout() {
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAbout() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'about')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setData(dbData.data as AboutData)
      }
      setLoading(false)
    }
    fetchAbout()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'about', data }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function handleParagraphChange(index: number, val: string) {
    const updated = [...data.paragraphs]
    updated[index] = val
    setData({ ...data, paragraphs: updated })
  }

  function addParagraph() {
    setData({ ...data, paragraphs: [...data.paragraphs, ''] })
  }

  function removeParagraph(index: number) {
    setData({ ...data, paragraphs: data.paragraphs.filter((_, i) => i !== index) })
  }

  function handleStatChange(index: number, field: string, val: string | number) {
    const updated = [...data.stats]
    updated[index] = { ...updated[index], [field]: val }
    setData({ ...data, stats: updated })
  }

  function addStat() {
    setData({ ...data, stats: [...data.stats, { label: 'New Metric', value: 0, suffix: '' }] })
  }

  function removeStat(index: number) {
    setData({ ...data, stats: data.stats.filter((_, i) => i !== index) })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading section data...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <UserCheck size={14} />
        </div>
        <span className="admin-header-title">About Section</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Manage bio paragraphs and key metrics</span>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} /> {fetchError}
          </div>
        )}

        {/* Bio Paragraphs */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-header-icon"><UserCheck size={15} /></div>
            <div>
              <div className="card-title">Bio Paragraphs</div>
              <div className="card-desc">Narrative background shown in the About section</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addParagraph} style={{ marginLeft: 'auto' }}>
              <Plus size={13} /> Add Paragraph
            </button>
          </div>
          <div className="card-body">
            {data.paragraphs.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <textarea
                  className="form-input form-textarea"
                  value={p}
                  onChange={e => handleParagraphChange(i, e.target.value)}
                  rows={3}
                  placeholder={`Paragraph ${i + 1}`}
                />
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeParagraph(i)}
                  style={{ color: 'var(--danger)', flexShrink: 0, height: 38 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats & Key Metrics */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-header-icon"><BarChart3 size={15} /></div>
            <div>
              <div className="card-title">Highlight Metrics</div>
              <div className="card-desc">Key metrics and counter badges</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addStat} style={{ marginLeft: 'auto' }}>
              <Plus size={13} /> Add Metric
            </button>
          </div>
          <div className="card-body">
            {data.stats.map((stat, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                  className="form-input"
                  value={stat.label}
                  onChange={e => handleStatChange(i, 'label', e.target.value)}
                  placeholder="Metric Label"
                />
                <input
                  type="number"
                  className="form-input"
                  value={stat.value}
                  onChange={e => handleStatChange(i, 'value', Number(e.target.value))}
                  placeholder="Value"
                />
                <input
                  className="form-input font-mono"
                  value={stat.suffix}
                  onChange={e => handleStatChange(i, 'suffix', e.target.value)}
                  placeholder="Suffix (e.g. +)"
                />
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeStat(i)}
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved successfully
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save About</>}
          </button>
        </div>
      </div>
    </>
  )
}
