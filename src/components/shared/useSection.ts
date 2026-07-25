import { useState, useCallback } from 'react'
import { portfolioSupabase } from '@/lib/supabase'
import { Save, Check } from 'lucide-react'

interface UseSectionResult<T> {
  data: T
  setData: (data: T | ((prev: T) => T)) => void
  save: () => Promise<void>
  saving: boolean
  saved: boolean
}

export function useSection<T>(
  sectionKey: string,
  defaultData: T,
): UseSectionResult<T> {
  const [data, setData] = useState<T>(defaultData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .upsert({ section: sectionKey, data }, { onConflict: 'section' })
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }, [sectionKey, data])

  return { data, setData, save, saving, saved }
}

interface SaveBarProps {
  saving: boolean
  saved: boolean
  onSave: () => void
  disabled?: boolean
}

export function SaveBar({ saving, saved, onSave, disabled }: SaveBarProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, paddingTop: 8 }}>
      {saved && (
        <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Check size={13} /> Saved
        </span>
      )}
      <button className="btn btn-primary" onClick={onSave} disabled={saving} style={{ minWidth: 120 }}>
        {saving
          ? <><div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
          : <><Save size={14} />Save</>
        }
      </button>
    </div>
  )
}
