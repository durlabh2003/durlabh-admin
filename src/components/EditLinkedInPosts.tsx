import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, Linkedin, AlertCircle } from 'lucide-react'

interface LinkedInPost {
  id: string
  title: string
  contentSnippet: string
  postUrl: string
  likes: number
  comments: number
  date: string
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
      title: 'LinkedIn Update',
      contentSnippet: 'Excerpt of the LinkedIn post content...',
      postUrl: 'https://linkedin.com/in/durlabhdaryani',
      likes: 120,
      comments: 15,
      date: '2026'
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
        <span className="admin-header-title">LinkedIn Posts</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Featured posts, engagement metrics & links</span>
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
              <span>Posts ({posts.length})</span>
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
                  <div className="array-list-item-label">{post.title || 'Untitled Post'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Form */}
          <div className="array-detail-panel">
            {selectedPost ? (
              <div className="array-detail-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedPost.title || 'Edit Post'}</h3>
                  <button className="btn btn-ghost btn-sm text-danger" onClick={() => removePost(selectedIndex)}>
                    <Trash2 size={13} /> Delete Post
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group form-group-full">
                    <label className="form-label">Post Headline / Topic</label>
                    <input
                      className="form-input"
                      value={selectedPost.title}
                      onChange={e => updateSelected('title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Post URL</label>
                    <input
                      className="form-input font-mono"
                      value={selectedPost.postUrl}
                      onChange={e => updateSelected('postUrl', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      className="form-input"
                      value={selectedPost.date}
                      onChange={e => updateSelected('date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Likes</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedPost.likes}
                      onChange={e => updateSelected('likes', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comments</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedPost.comments}
                      onChange={e => updateSelected('comments', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Content Snippet</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={4}
                      value={selectedPost.contentSnippet}
                      onChange={e => updateSelected('contentSnippet', e.target.value)}
                    />
                  </div>
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
              <Check size={13} /> Saved LinkedIn Posts
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
