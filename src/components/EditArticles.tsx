import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react'

interface Article {
  id: string
  title: string
  excerpt: string
  url: string
  platform: string
  date: string
  readTime: string
}

export default function EditArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'articles')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setArticles(dbData.data as Article[])
      }
      setLoading(false)
    }
    fetchArticles()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'articles', data: articles }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addArticle() {
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title: 'Article Title',
      excerpt: 'Brief overview of the article concept or post.',
      url: 'https://medium.com/@durlabhdaryani',
      platform: 'Medium',
      date: '2026',
      readTime: '5 min read'
    }
    const updated = [...articles, newArt]
    setArticles(updated)
    setSelectedIndex(updated.length - 1)
  }

  function removeArticle(index: number) {
    const updated = articles.filter((_, i) => i !== index)
    setArticles(updated)
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1))
    }
  }

  function updateSelected(field: keyof Article, val: any) {
    if (articles.length === 0) return
    const updated = [...articles]
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
    setArticles(updated)
  }

  const selectedArt = articles[selectedIndex]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading articles...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <BookOpen size={14} />
        </div>
        <span className="admin-header-title">Articles & Thought Leadership</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Medium posts, essays & frameworks</span>
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
              <span>Articles ({articles.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addArticle} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {articles.map((art, i) => (
                <button
                  key={art.id || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{art.title || 'Untitled Post'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedArt ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedArt.title || 'Edit Article'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removeArticle(selectedIndex)}>
                    <Trash2 size={13} /> Delete Article
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group form-group-full">
                    <label className="form-label">Article Title</label>
                    <input
                      className="form-input"
                      value={selectedArt.title}
                      onChange={e => updateSelected('title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Platform (e.g. Medium / Substack)</label>
                    <input
                      className="form-input"
                      value={selectedArt.platform}
                      onChange={e => updateSelected('platform', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Read Time</label>
                    <input
                      className="form-input"
                      value={selectedArt.readTime}
                      onChange={e => updateSelected('readTime', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Published</label>
                    <input
                      className="form-input"
                      value={selectedArt.date}
                      onChange={e => updateSelected('date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL / Link</label>
                    <input
                      className="form-input font-mono"
                      value={selectedArt.url}
                      onChange={e => updateSelected('url', e.target.value)}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Excerpt / Teaser</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={selectedArt.excerpt}
                      onChange={e => updateSelected('excerpt', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No article selected. Select or add one.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Articles
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Articles</>}
          </button>
        </div>
      </div>
    </>
  )
}
