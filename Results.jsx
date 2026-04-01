import { useMemo } from 'react'
import { useQuestions } from '../hooks/useQuestions'
import { useResponses } from '../hooks/useResponses'
import { CORE_DRIVES, computeOctalysis } from '../constants/octalysis'
import OctalysisChart from './OctalysisChart'

export default function Results() {
  const { questions } = useQuestions()
  const { responses } = useResponses()
  const scores = useMemo(() => computeOctalysis(questions, responses), [questions, responses])

  const overall = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0
  const weakest = [...scores].sort((a,b) => a.score - b.score).slice(0, 3)
  const strongest = [...scores].sort((a,b) => b.score - a.score).slice(0, 3)

  const recommendations = {
    CD1: "Renforcer la communication de la vision. Organiser des séances de partage de la mission.",
    CD2: "Mettre en place des systèmes de progression visibles. Définir des jalons clairs.",
    CD3: "Créer des espaces d'initiative. Valoriser les idées remontées du terrain.",
    CD4: "Impliquer les opérateurs dans les décisions. Développer le sentiment d'appartenance.",
    CD5: "Renforcer les moments de cohésion. Favoriser la reconnaissance entre pairs.",
    CD6: "Revoir la gestion des ressources. Créer de la valeur par la rareté positive.",
    CD7: "Introduire des défis et nouvelles missions régulières. Stimuler la curiosité.",
    CD8: "Revoir le cadre des sanctions. Réduire le stress par plus de clarté et de soutien.",
  }

  const S = {
    card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 },
    title: { fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Résultats Octalysis</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Analyse basée sur {responses.length} réponses collectées</p>

      {/* Global score */}
      <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 24, background: '#0a1628', border: '1px solid #1e3a5f' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 54, fontWeight: 700, color: overall >= 60 ? '#10B981' : overall >= 40 ? '#F59E0B' : '#EF4444', fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{overall}%</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Score global</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
            {overall >= 70 ? '✓ Engagement fort' : overall >= 45 ? '△ Engagement modéré — à renforcer' : '⚠ Engagement faible — action prioritaire'}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
            {overall >= 70
              ? 'Le système de motivation est bien équilibré. Maintenez les bonnes pratiques et continuez à collecter des données.'
              : overall >= 45
              ? 'Des axes d\'amélioration significatifs ont été identifiés. Priorisez les Core Drives les plus faibles.'
              : 'L\'engagement global est insuffisant. Une refonte des mécanismes de motivation est recommandée.'}
          </div>
        </div>
      </div>

      {/* Main charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <div style={S.title}>Octagramme Octalysis</div>
          <OctalysisChart scores={scores} />
        </div>
        <div style={S.card}>
          <div style={S.title}>Détail par Core Drive</div>
          {scores.map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: s.color }}>{s.icon} {s.label}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#475569' }}>{s.count} rép.</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: s.score >= 60 ? '#10B981' : s.score >= 40 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>{s.score}%</span>
                </div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 4, height: 7 }}>
                <div style={{ background: s.color, width: `${s.score}%`, height: '100%', borderRadius: 4, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points forts / faibles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <div style={S.title}>✓ Points forts</div>
          {strongest.map(s => (
            <div key={s.id} style={{ background: s.color + '0a', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Score {s.score}% — Levier d'engagement actif</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.title}>⚠ Axes d'amélioration</div>
          {weakest.map(s => (
            <div key={s.id} style={{ background: '#EF444408', border: '1px solid #EF444433', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{recommendations[s.id]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
