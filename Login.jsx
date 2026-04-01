import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../constants/octalysis'

const S = {
  page: {
    minHeight: '100vh', background: '#030712', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24,
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
    padding: '36px 40px', width: '100%', maxWidth: 420,
  },
  input: {
    background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
    padding: '11px 14px', color: '#f1f5f9', fontSize: 14, width: '100%',
    outline: 'none', boxSizing: 'border-box', transition: 'border .15s',
  },
  label: { fontSize: 12, color: '#64748b', marginBottom: 6, display: 'block', fontWeight: 500 },
  btn: {
    background: '#F59E0B22', border: '1px solid #F59E0B88', color: '#F59E0B',
    padding: '13px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
    fontWeight: 600, width: '100%', transition: 'all .15s',
  },
  error: {
    background: '#EF444422', border: '1px solid #EF444455', color: '#EF4444',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  success: {
    background: '#10B98122', border: '1px solid #10B98155', color: '#10B981',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
}

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]       = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm]       = useState({ email: '', password: '', full_name: '', role: 'operateur' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) setError(error.message)
    } else {
      if (!form.full_name.trim()) { setError('Le nom complet est requis.'); setLoading(false); return }
      const { error } = await signUp({ email: form.email, password: form.password, full_name: form.full_name, role: form.role })
      if (error) setError(error.message)
      else setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
    }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: #F59E0B !important; }
        select:focus { border-color: #F59E0B !important; outline: none; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: '#F59E0B', marginBottom: 10, fontFamily: "'Space Mono', monospace" }}>
          USINE ÉCOLE
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: -1 }}>
          Octalysis Factory<span style={{ color: '#F59E0B' }}>.</span>
        </h1>
        <p style={{ color: '#475569', marginTop: 8, fontSize: 14 }}>Outil de diagnostic gamification</p>
      </div>

      <div style={S.card}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: 28 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer',
                color: mode === m ? '#F59E0B' : '#475569', fontWeight: mode === m ? 600 : 400,
                fontSize: 13, borderBottom: mode === m ? '2px solid #F59E0B' : '2px solid transparent',
                marginBottom: -1, transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
              {m === 'login' ? 'Connexion' : 'Créer un compte'}
            </button>
          ))}
        </div>

        {error   && <div style={S.error}>⚠ {error}</div>}
        {success && <div style={S.success}>✓ {success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'register' && (
            <div>
              <label style={S.label}>Nom complet</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Marie Dupont" style={S.input} required />
            </div>
          )}
          <div>
            <label style={S.label}>Adresse email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="email@usine.fr" style={S.input} required />
          </div>
          <div>
            <label style={S.label}>Mot de passe</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••" style={S.input} minLength={6} required />
          </div>
          {mode === 'register' && (
            <div>
              <label style={S.label}>Rôle dans l'usine</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                style={{ ...S.input, cursor: 'pointer' }}>
                {Object.entries(ROLES).map(([key, r]) => (
                  <option key={key} value={key}>{r.icon} {r.label} — {r.subtitle}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1, marginTop: 4 }}>
            {loading ? '...' : mode === 'login' ? '→ Se connecter' : '→ Créer le compte'}
          </button>
        </form>

        {mode === 'register' && (
          <p style={{ fontSize: 11, color: '#334155', marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            Note : le rôle <strong style={{ color: '#F59E0B' }}>Intervenant</strong> doit être accordé manuellement par un admin dans Supabase.
          </p>
        )}
      </div>
    </div>
  )
}
