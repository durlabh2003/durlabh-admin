import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, Linkedin, AlertCircle } from 'lucide-react'

interface LinkedInPost {
  id: string
  title: string
  embedCode: string
  postUrl?: string
  date?: string
}

export default function EditLinkedInPosts() {
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'linkedin_posts')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        setPosts(dbData.data as LinkedInPost[])
      }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'linkedin_posts', data: posts }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addPost() {
    const newPost: LinkedInPost = {
      id: `post-${Date.now()}`,
      title: 'LinkedIn Post',
      embedCode: '<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:..." height="600" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>',
      postUrl: '',
      date: new Date().toISOString().split('T')[0]
    }
    const updated = [...posts, newPost]
    setPosts(updated)
    setSelectedIndex(updated.length - 1)
  }

  function removePost(index: number) {
    const updated = posts.filter((_, i) => i !== index)
    setPosts(updated)
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1))
    }
  }

  function updateSelected(field: keyof LinkedInPost, val: any) {
    if (posts.length === 0) return
    const updated = [...posts]
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: val }
    setPosts(updated)
  }

  const selectedPost = posts[selectedIndex]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading LinkedIn posts...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <Linkedin size={14} />
        </div>
        <span className="admin-header-title">LinkedIn Embed Posts</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Paste embedded iframe code from LinkedIn</span>
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
              <span>Embeds ({posts.length})</span>
              <button className="btn btn-ghost btn-sm" onClick={addPost} style={{ padding: '2px 6px' }}>
                <Plus size={13} />
              </button>
            </div>
            <div className="array-list-items">
              {posts.map((post, i) => (
                <button
                  key={post.id || i}
                  className={`array-list-item ${selectedIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="array-list-item-dot" />
                  <div className="array-list-item-label">{post.title || 'Untitled Embed'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedPost ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedPost.title || 'Edit Embed'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removePost(selectedIndex)}>
                    <Trash2 size={13} /> Delete Post
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group form-group-full">
                    <label className="form-label">Post Title / Topic (for internal organization)</label>
                    <input
                      className="form-input"
                      value={selectedPost.title}
                      onChange={e => updateSelected('title', e.target.value)}
                      placeholder="e.g., AI Agent Launch Post"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original LinkedIn Post URL (Optional)</label>
                    <input
                      className="form-input font-mono"
                      value={selectedPost.postUrl || ''}
                      onChange={e => updateSelected('postUrl', e.target.value)}
                      placeholder="https://linkedin.com/posts/..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date (Optional)</label>
                    <input
                      className="form-input"
                      value={selectedPost.date || ''}
                      onChange={e => updateSelected('date', e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">LinkedIn Embed HTML Code (&lt;iframe ...&gt;)</label>
                    <textarea
                      className="form-input form-textarea font-mono"
                      rows={5}
                      value={selectedPost.embedCode || ''}
                      onChange={e => updateSelected('embedCode', e.target.value)}
                      placeholder='<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:..." ...></iframe>'
                      style={{ fontSize: 12 }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Tip: On LinkedIn, click the 3 dots (...) on your post → "Embed this post" → copy the code and paste it here.
                    </p>
                  </div>

                  {/* Embed Preview */}
                  {selectedPost.embedCode && (
                    <div className="form-group form-group-full" style={{ marginTop: 12 }}>
                      <label className="form-label">Live Embed Preview</label>
                      <div
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: 16,
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          overflow: 'auto',
                          maxHeight: 500,
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedPost.embedCode }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="array-detail-placeholder">No LinkedIn post selected. Add or select one.</div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved LinkedIn Embeds
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Posts</>}
          </button>
        </div>
      </div>
    </>
  )
}
