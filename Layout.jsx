import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../constants/octalysis'

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const role      = profile?.role
  const roleConf  = ROLES[role] || {}

  const navItems = [
    { path: '/',              label: 'Tableau de bord', icon: '⊞', roles: ['intervenant','chef_projet','operateur'] },
    { path: '/questionnaire', label: 'Questionnaire',   icon: '✎', roles: ['chef_projet','operateur'] },
    { path: '/results',       label: 'Résultats Octalysis', icon: '◉', roles: ['intervenant','chef_projet','operateur'] },
    { path: '/responses',     label: 'Réponses collectées', icon: '◎', roles: ['intervenant','chef_projet'] },
    { path: '/manage',        label: 'Gérer les questions', icon: '◈', roles: ['intervenant'] },
  ].filter(n => n.roles.includes(role))

  const active = (p) => location.pathname === p

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#030712', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }`}</style>

      {/* Sidebar */}
      <aside style={{ width: 230, background: '#060e1a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 22px', borderBottom: '1px solid #1e293b', marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: '#334155', marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>OCTALYSIS FACTORY</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: roleConf.color }}>{roleConf.icon} {roleConf.label}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{profile?.full_name}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                background: active(n.path) ? roleConf.color + '18' : 'none',
                border: 'none', cursor: 'pointer',
                color: active(n.path) ? roleConf.color : '#64748b',
                fontSize: 13, fontWeight: active(n.path) ? 600 : 400,
                width: '100%', textAlign: 'left',
                borderLeft: active(n.path) ? `2px solid ${roleConf.color}` : '2px solid transparent',
                transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
              }}>
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>

        {/* Profil + Déconnexion */}
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 11, color: '#334155', marginBottom: 10, fontFamily: "'Space Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.email}
          </div>
          <button onClick={signOut}
            style={{ background: '#EF444422', border: '1px solid #EF444455', color: '#EF4444', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, width: '100%', fontFamily: "'DM Sans', sans-serif" }}>
            ← Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 230, flex: 1, padding: 36, minHeight: '100vh', maxWidth: 'calc(100vw - 230px)', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
