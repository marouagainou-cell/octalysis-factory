import { CORE_DRIVES } from '../constants/octalysis'

export default function OctalysisChart({ scores }) {
  const cx = 200, cy = 200, r = 155
  const n = 8
  const points = scores.map((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    const ratio = s.score / 100
    return { x: cx + Math.cos(angle) * r * ratio, y: cy + Math.sin(angle) * r * ratio, angle, ...s }
  })
  const outerPts = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, angle }
  })
  const polyStr  = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 400 }}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0a1020" />
        </radialGradient>
        <linearGradient id="fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={r + 35} fill="url(#bg)" />

      {/* Grid */}
      {[.25,.5,.75,1].map((lv, li) => {
        const gp = outerPts.map(op => {
          const dx = op.x - cx, dy = op.y - cy
          return `${cx + dx * lv},${cy + dy * lv}`
        }).join(' ')
        return <polygon key={li} points={gp} fill="none" stroke="#1e3a5f" strokeWidth={li === 3 ? 1.2 : .7} strokeDasharray={li < 3 ? '3 3' : 'none'} />
      })}
      {outerPts.map((op, i) => <line key={i} x1={cx} y1={cy} x2={op.x} y2={op.y} stroke="#1e3a5f" strokeWidth={.7} />)}

      {/* Score polygon */}
      <polygon points={polyStr} fill="url(#fill)" stroke="#F59E0B" strokeWidth={2} strokeLinejoin="round" opacity={.9} />

      {/* Points & labels */}
      {points.map((p, i) => {
        const labelR = r + 22
        const lx = cx + Math.cos(p.angle) * labelR
        const ly = cy + Math.sin(p.angle) * labelR
        const ta = lx < cx - 8 ? 'end' : lx > cx + 8 ? 'start' : 'middle'
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill={p.color} stroke="#030712" strokeWidth={1.5} />
            <text x={lx} y={ly - 5} textAnchor={ta} dominantBaseline="middle" fontSize={9} fill={p.color} fontFamily="monospace" fontWeight="bold">
              {p.icon} {p.short}
            </text>
            <text x={lx} y={ly + 7} textAnchor={ta} fontSize={9} fill="#64748b" fontFamily="monospace">
              {p.score}%
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={3} fill="#F59E0B" />
    </svg>
  )
}
