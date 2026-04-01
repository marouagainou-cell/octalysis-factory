import { useState } from 'react'
import { useResponses } from '../hooks/useResponses'
import { CORE_DRIVES, ROLES } from '../constants/octalysis'

export default function Responses() {
  const { responses, loading } = useResponses()
  const [filterPillar, setFilterPillar] = useState('all')
  const [filterRole,   setFilterRole]   = useState('all')
  const [search,       setSearch]       = useState('')

  const filtered = responses.filter(r => {
    const pillarMatch = filterPillar === 'all' || r.questions?.pillar === filterPillar
    const roleMatch   = filterRole === 'all'   || r.profiles?.role   === filterRole
    const searchMatch = !search || r.questions?.text?.toLowerCase().includes(search.toLowerCase()) || r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    return pillarMatch && roleMatch && searchMatch
  })

  const S = {
    card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 },
    select: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', cursor: 'pointer' },
    input: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '9px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', flex: 1 },
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40 }}>Chargement...</div>

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Réponses collectées</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{filtered.length} réponse(s) affichée(s) sur {responses.length}</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par question ou par nom..." style={S.input} />
        <select value={filterPillar} onChange={e => setFilterPillar(e.target.value)} style={S.select}>
          <option value="all">Tous les piliers</option>
          {CORE_DRIVES.map(cd => <option key={cd.id} value={cd.id}>{cd.icon} {cd.id} — {cd.short}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={S.select}>
          <option value="all">Tous les rôles</option>
          <option value="operateur">Opérateurs</option>
          <option value="chef_projet">Chefs de projet</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', color: '#64748b', padding: 48 }}>
          Aucune réponse ne correspond aux filtres sélectionnés.
        </div>
      )}

      {filtered.map(r => {
        const cd       = CORE_DRIVES.find(d => d.id === r.questions?.pillar)
        const roleConf = ROLES[r.profiles?.role] || {}
        return (
          <div key={r.id} style={{ ...S.card, padding: 18, marginBottom: 12, borderLeft: `3px solid ${cd?.color || '#334155'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {cd && (
                  <span style={{ background: cd.color + '22', color: cd.color, border: `1px solid ${cd.color}44`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>
                    {cd.icon} {cd.id}
                  </span>
                )}
                <span style={{ background: roleConf.color + '22', color: roleConf.color, border: `1px solid ${roleConf.color}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                  {roleConf.icon} {r.profiles?.full_name || 'Anonyme'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>
                {new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>
              {r.questions?.text}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {r.value_num != null ? (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.value_num ? '#F59E0B' : '#334155', fontSize: 18 }}>★</span>)}
                  <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{r.value_num}/5</span>
                </div>
              ) : r.value_text ? (
                <span style={{ fontSize: 12, color: '#F59E0B', background: '#F59E0B22', padding: '4px 10px', borderRadius: 6 }}>{r.value_text}</span>
              ) : null}
              {r.comment && (
                <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>« {r.comment} »</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
