import { useState } from 'react'
import { useAuth }      from '../hooks/useAuth'
import { useQuestions } from '../hooks/useQuestions'
import { useResponses } from '../hooks/useResponses'
import { CORE_DRIVES }  from '../constants/octalysis'

function StarScale({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => !disabled && onChange(n)}
          style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
            fontSize: 24, color: n <= value ? '#F59E0B' : '#334155', padding: 0, transition: 'color .15s' }}>
          ★
        </button>
      ))}
      {value > 0 && <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{value}/5</span>}
    </div>
  )
}

export default function Questionnaire() {
  const { profile }             = useAuth()
  const { myQuestions, loading: qLoading } = useQuestions()
  const { myAnswerMap, submitBatch } = useResponses()

  const [answers,  setAnswers]  = useState({}) // { questionId: { value_num, value_text, comment } }
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  // Pre-fill with existing answers
  const getAns = (qid) => answers[qid] ?? {
    value_num:  myAnswerMap[qid]?.value_num  ?? null,
    value_text: myAnswerMap[qid]?.value_text ?? '',
    comment:    myAnswerMap[qid]?.comment    ?? '',
  }

  const setField = (qid, field, val) =>
    setAnswers(p => ({ ...p, [qid]: { ...getAns(qid), [field]: val } }))

  async function handleSubmit() {
    setSaving(true); setError('')
    const rows = myQuestions.map(q => ({
      question_id: q.id,
      value_num:   getAns(q.id).value_num,
      value_text:  getAns(q.id).value_text,
      comment:     getAns(q.id).comment,
    })).filter(r => r.value_num !== null || r.value_text)
    const { error } = await submitBatch(rows)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 4000) }
    setSaving(false)
  }

  const pillarsDone = [...new Set(myQuestions.map(q => q.pillar))]
    .filter(p => myQuestions.filter(q => q.pillar === p).every(q => {
      const a = getAns(q.id)
      return a.value_num !== null || a.value_text
    }))

  if (qLoading) return <div style={{ color: '#64748b', padding: 40 }}>Chargement des questions...</div>

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Mon questionnaire</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 10 }}>{myQuestions.length} questions pour votre profil</p>

      {/* Progress */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            <span>Piliers complétés</span><span style={{ color: '#F59E0B', fontFamily: 'monospace' }}>{pillarsDone.length}/{[...new Set(myQuestions.map(q=>q.pillar))].length}</span>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 4, height: 5 }}>
            <div style={{ background: '#F59E0B', width: `${(pillarsDone.length / Math.max([...new Set(myQuestions.map(q=>q.pillar))].length,1)) * 100}%`, height: '100%', borderRadius: 4, transition: 'width .4s' }} />
          </div>
        </div>
      </div>

      {error && <div style={{ background: '#EF444422', border: '1px solid #EF444455', color: '#EF4444', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 20 }}>⚠ {error}</div>}
      {saved && <div style={{ background: '#10B98122', border: '1px solid #10B98155', color: '#10B981', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 20 }}>✓ Réponses enregistrées avec succès !</div>}

      {CORE_DRIVES.filter(cd => myQuestions.some(q => q.pillar === cd.id)).map(cd => {
        const cdQs = myQuestions.filter(q => q.pillar === cd.id)
        return (
          <div key={cd.id} style={{ background: '#0f172a', border: `1px solid #1e293b`, borderLeft: `3px solid ${cd.color}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ fontSize: 20, color: cd.color }}>{cd.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: cd.color }}>{cd.label}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{cd.id} — {cdQs.length} question(s)</div>
              </div>
            </div>

            {cdQs.map((q, qi) => {
              const ans = getAns(q.id)
              return (
                <div key={q.id} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: qi < cdQs.length-1 ? '1px solid #1e293b' : 'none' }}>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.65, marginBottom: 12 }}>
                    <span style={{ color: cd.color, fontFamily: 'monospace', marginRight: 6 }}>{qi+1}.</span>
                    {q.text}
                  </p>
                  {q.type === 'scale' && (
                    <StarScale value={ans.value_num || 0} onChange={v => setField(q.id, 'value_num', v)} />
                  )}
                  {q.type === 'multiple' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(q.options || []).map(opt => (
                        <button key={opt} onClick={() => setField(q.id, 'value_text', opt)}
                          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                            border: `1px solid ${ans.value_text === opt ? cd.color : '#334155'}`,
                            background: ans.value_text === opt ? cd.color + '22' : '#1e293b',
                            color: ans.value_text === opt ? cd.color : '#94a3b8' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && (
                    <textarea value={ans.value_text} onChange={e => setField(q.id, 'value_text', e.target.value)}
                      placeholder="Votre réponse..." rows={3}
                      style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, width: '100%', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
                  )}
                  <input value={ans.comment} onChange={e => setField(q.id, 'comment', e.target.value)}
                    placeholder="Remarque optionnelle..."
                    style={{ marginTop: 10, background: '#1e293b', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px', color: '#94a3b8', fontSize: 12, width: '100%', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              )
            })}
          </div>
        )
      })}

      <button onClick={handleSubmit} disabled={saving}
        style={{ background: '#F59E0B22', border: '1px solid #F59E0B88', color: '#F59E0B', padding: '14px', borderRadius: 12, cursor: saving ? 'default' : 'pointer', fontSize: 15, fontWeight: 700, width: '100%', transition: 'all .15s', opacity: saving ? .6 : 1, fontFamily: "'DM Sans', sans-serif" }}>
        {saving ? '...' : '✓ Enregistrer mes réponses'}
      </button>
    </div>
  )
}
