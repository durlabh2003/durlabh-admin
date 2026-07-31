import { useState, useEffect } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check, Plus, Trash2, Code2, AlertCircle } from 'lucide-react'

interface SkillCategory {
  category: string
  skills: string[]
}

export default function EditSkills() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true)
      const { data: dbData, error } = await portfolioSupabase
        .from('portfolio_content')
        .select('data')
        .eq('section', 'skills')
        .maybeSingle()

      if (error) {
        setFetchError(error.message)
      } else if (dbData?.data) {
        const raw = dbData.data
        if (Array.isArray(raw)) {
          setCategories(raw as SkillCategory[])
        } else if (typeof raw === 'object' && raw !== null) {
          // Convert Object { "Product": ["Discovery", ...], "AI": [...] } -> SkillCategory[]
          const converted: SkillCategory[] = Object.entries(raw).map(([category, skills]) => ({
            category,
            skills: Array.isArray(skills) ? skills : []
          }))
          setCategories(converted)
        }
      }
      setLoading(false)
    }
    fetchSkills()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    // Convert array back to dictionary object { "Product": [...], "AI": [...] } for portfolio compatibility
    const objPayload: Record<string, string[]> = {}
    categories.forEach(item => {
      if (item.category.trim()) {
        objPayload[item.category.trim()] = item.skills
      }
    })

    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: 'skills', data: objPayload }, { onConflict: 'section' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert(`Save error: ${error.message}`)
    }
    setSaving(false)
  }

  function addCategory() {
    setCategories([...categories, { category: 'New Skill Category', skills: [] }])
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index))
  }

  function updateCategoryTitle(index: number, val: string) {
    const updated = [...categories]
    updated[index].category = val
    setCategories(updated)
  }

  function removeSkill(catIndex: number, skillIndex: number) {
    const updated = [...categories]
    updated[catIndex].skills = updated[catIndex].skills.filter((_, i) => i !== skillIndex)
    setCategories(updated)
  }

  function addSkill(catIndex: number, skillName: string) {
    if (!skillName.trim()) return
    const updated = [...categories]
    updated[catIndex].skills = [...updated[catIndex].skills, skillName.trim()]
    setCategories(updated)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <div className="loading-spinner" /> Loading skills...
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div className="card-header-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
          <Code2 size={14} />
        </div>
        <span className="admin-header-title">Skills & Frameworks</span>
        <span className="admin-header-divider">·</span>
        <span className="admin-header-subtitle">Grouped technical and PM competencies</span>
      </div>

      <div className="admin-body">
        {fetchError && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={14} /> {fetchError}
          </div>
        )}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-header-icon"><Code2 size={15} /></div>
            <div>
              <div className="card-title">Skill Groups ({categories.length})</div>
              <div className="card-desc">Categories and chips displayed in your skills matrix</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addCategory} style={{ marginLeft: 'auto' }}>
              <Plus size={13} /> Add Category
            </button>
          </div>
          <div className="card-body">
            <div className="skills-groups">
              {categories.map((cat, catIdx) => (
                <div key={catIdx} className="skills-group">
                  <div className="skills-group-header">
                    <input
                      className="skills-group-name"
                      value={cat.category}
                      onChange={e => updateCategoryTitle(catIdx, e.target.value)}
                    />
                    <button className="btn btn-ghost btn-icon btn-sm text-danger" onClick={() => removeCategory(catIdx)}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="skills-tags">
                    {(cat.skills || []).map((skill, sIdx) => (
                      <span key={sIdx} className="skill-tag">
                        {skill}
                        <button onClick={() => removeSkill(catIdx, sIdx)}><Trash2 size={11} /></button>
                      </span>
                    ))}
                  </div>

                  <div className="skill-add-row">
                    <input
                      id={`add-skill-input-${catIdx}`}
                      className="form-input"
                      placeholder="Add skill (press Enter)..."
                      style={{ height: 32, fontSize: 12 }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          addSkill(catIdx, e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved Skills
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Skills</>}
          </button>
        </div>
      </div>
    </>
  )
}
