export const CORE_DRIVES = [
  { id: 'CD1', label: 'Signification Épique',            short: 'Vocation',       color: '#F59E0B', icon: '★' },
  { id: 'CD2', label: 'Développement & Accomplissement', short: 'Accomplissement', color: '#10B981', icon: '▲' },
  { id: 'CD3', label: 'Autonomisation & Créativité',     short: 'Créativité',     color: '#3B82F6', icon: '◈' },
  { id: 'CD4', label: 'Propriété & Possession',          short: 'Propriété',      color: '#8B5CF6', icon: '◆' },
  { id: 'CD5', label: 'Influence Sociale',               short: 'Social',         color: '#EC4899', icon: '◎' },
  { id: 'CD6', label: 'Rareté & Impatience',             short: 'Rareté',         color: '#F97316', icon: '⬡' },
  { id: 'CD7', label: 'Imprévisibilité & Curiosité',     short: 'Curiosité',      color: '#06B6D4', icon: '◉' },
  { id: 'CD8', label: 'Perte & Évitement',               short: 'Évitement',      color: '#EF4444', icon: '▼' },
]

export const ROLES = {
  intervenant: { label: 'Intervenant',    subtitle: 'Expert / Consultant',        icon: '◈', color: '#F59E0B' },
  chef_projet:  { label: 'Chef de Projet', subtitle: 'Observateur / Contrôleur',   icon: '◎', color: '#3B82F6' },
  operateur:    { label: 'Opérateur',      subtitle: 'Ouvrier / Technicien',       icon: '▲', color: '#10B981' },
}

export function computeOctalysis(questions, responses) {
  const scores = {}
  CORE_DRIVES.forEach(cd => { scores[cd.id] = { total: 0, count: 0 } })
  responses.forEach(r => {
    const q = questions.find(q => q.id === r.question_id)
    if (q && r.value_num != null) {
      scores[q.pillar].total += Number(r.value_num)
      scores[q.pillar].count += 1
    }
  })
  return CORE_DRIVES.map(cd => ({
    ...cd,
    score: scores[cd.id].count > 0 ? Math.round((scores[cd.id].total / scores[cd.id].count) * 20) : 0,
    raw:   scores[cd.id].count > 0 ? scores[cd.id].total / scores[cd.id].count : 0,
    count: scores[cd.id].count,
  }))
}
