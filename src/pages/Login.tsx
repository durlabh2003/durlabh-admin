import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Step 1: Sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Step 2: Get the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Could not retrieve user after sign in.')
      setLoading(false)
      return
    }

    // Step 3: Check admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError) {
      setError('Error checking permissions: ' + roleError.message)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!roleData) {
      await supabase.auth.signOut()
      setError('Access denied. This account does not have admin privileges.')
      setLoading(false)
      return
    }

    // Step 4: All good — navigate to admin
    navigate('/admin', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">DD</div>
          <div className="login-logo-text">
            <span className="login-logo-title">Portfolio Admin</span>
            <span className="login-logo-sub">admin.durlabh.dev</span>
          </div>
        </div>

        <h1 className="login-heading">Welcome back</h1>
        <p className="login-subheading">Sign in to manage your portfolio content.</p>

        {error && (
          <div className="login-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: 0,
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !email || !password}
            style={{ height: 42, fontSize: 15 }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Admin access only. This page is not indexed.
        </p>
      </div>
    </div>
  )
}
