import { useMemo } from 'react'
import { useAuth }      from '../hooks/useAuth'
import { useQuestions } from '../hooks/useQuestions'
import { useResponses } from '../hooks/useResponses'
import { ROLES, CORE_DRIVES, computeOctalysis } from '../constants/octalysis'
import OctalysisChart from './OctalysisChart'

const S = {
  card:  { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 },
  title: { fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
  h1:    { fontSize: 26, fontWeight: 700, marginBottom: 6, letterSpacing: -.5, margin: 0 },
}

export default function Dashboard() {
  const { profile }     = useAuth()
  const { questions }   = useQuestions()
  const { responses }   = useResponses()
  const roleConf = ROLES[profile?.role] || {}

  const octalysis = useMemo(() => computeOctalysis(questions, responses), [questions, responses])
  const uniqueUsers = [...new Set(responses.map(r => r.user_id))].length

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={S.h1}>Bonjour, <span style={{ color: roleConf.color }}>{profile?.full_name}</span> 👋</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
          {roleConf.icon} {roleConf.label} — {profile?.usine || 'Usine École'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Questions actives', value: questions.length, color: '#F59E0B' },
          { label: 'Réponses collectées', value: responses.length, color: '#10B981' },
          { label: 'Répondants uniques', value: uniqueUsers, color: '#3B82F6' },
          { label: 'Piliers couverts', value: [...new Set(questions.map(q => q.pillar))].length, color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} style={S.card}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <div style={S.title}>Octagramme Octalysis</div>
          <OctalysisChart scores={octalysis} />
        </div>
        <div style={S.card}>
          <div style={S.title}>Score par Core Drive</div>
          {octalysis.map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: s.color }}>{s.icon} {s.short}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", color: '#94a3b8', fontSize: 11 }}>{s.score}% <span style={{ color: '#475569' }}>({s.count} rép.)</span></span>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 4, height: 6 }}>
                <div style={{ background: s.color, width: `${s.score}%`, height: '100%', borderRadius: 4, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
