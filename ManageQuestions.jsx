import { useState } from 'react'
import { useQuestions } from '../hooks/useQuestions'
import { useResponses } from '../hooks/useResponses'
import { CORE_DRIVES }  from '../constants/octalysis'

const EMPTY_Q = { text: '', pillar: 'CD1', target_role: 'all', type: 'scale', options: '' }

export default function ManageQuestions() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, loading } = useQuestions()
  const { responses } = useResponses()

  const [editId,      setEditId]      = useState(null)
  const [editData,    setEditData]    = useState(null)
  const [newQ,        setNewQ]        = useState(EMPTY_Q)
  const [showAdd,     setShowAdd]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [notification, setNotify]     = useState(null)

  const notify = (msg, type = 'success') => {
    setNotify({ msg, type })
    setTimeout(() => setNotify(null), 3500)
  }

  async function handleAdd() {
    if (!newQ.text.trim()) return
    setSaving(true)
    const payload = {
      text: newQ.text, pillar: newQ.pillar,
      target_role: newQ.target_role, type: newQ.type,
      options: newQ.type === 'multiple' ? newQ.options.split(',').map(s => s.trim()).filter(Boolean) : null,
      order_index: questions.length + 1,
    }
    const { error } = await addQuestion(payload)
    if (error) notify(error.message, 'error')
    else { notify('Question ajoutée !'); setNewQ(EMPTY_Q); setShowAdd(false) }
    setSaving(false)
  }

  async function handleUpdate() {
    setSaving(true)
    const payload = {
      text: editData.text, pillar: editData.pillar,
      target_role: editData.target_role, type: editData.type,
      options: editData.type === 'multiple'
        ? (typeof editData.options === 'string' ? editData.options.split(',').map(s=>s.trim()).filter(Boolean) : editData.options)
        : null,
    }
    const { error } = await updateQuestion(editId, payload)
    if (error) notify(error.message, 'error')
    else { notify('Question mise à jour !'); setEditId(null); setEditData(null) }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette question ?')) return
    const { error } = await deleteQuestion(id)
    if (error) notify(error.message, 'error')
    else notify('Question supprimée.')
  }

  const S = {
    card:  { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 16 },
    title: { fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 },
    input: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, width: '100%', outline: 'none', boxSizing: 'border-box' },
    select: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', cursor: 'pointer' },
    btn: (c) => ({ background: c+'22', border: `1px solid ${c}55`, color: c, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }),
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40 }}>Chargement...</div>

  const FormBlock = ({ data, setData, onSave, onCancel, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' }}>Texte de la question *</label>
        <textarea value={data.text} onChange={e => setData(p=>({...p, text: e.target.value}))}
          placeholder="Entrez votre question..." rows={3}
          style={{ ...S.input, resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' }}>Pilier Octalysis</label>
          <select value={data.pillar} onChange={e => setData(p=>({...p, pillar: e.target.value}))} style={S.select}>
            {CORE_DRIVES.map(cd => <option key={cd.id} value={cd.id}>{cd.icon} {cd.id} — {cd.short}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' }}>Cible</label>
          <select value={data.target_role} onChange={e => setData(p=>({...p, target_role: e.target.value}))} style={S.select}>
            <option value="all">Tous les rôles</option>
            <option value="operateur">Opérateurs uniquement</option>
            <option value="chef_projet">Chefs de projet uniquement</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' }}>Type de réponse</label>
          <select value={data.type} onChange={e => setData(p=>({...p, type: e.target.value}))} style={S.select}>
            <option value="scale">Échelle 1–5 ⭐</option>
            <option value="multiple">Choix multiple</option>
            <option value="text">Texte libre</option>
          </select>
        </div>
      </div>
      {data.type === 'multiple' && (
        <div>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' }}>Options (séparées par virgule)</label>
          <input value={Array.isArray(data.options) ? data.options.join(', ') : data.options}
            onChange={e => setData(p=>({...p, options: e.target.value}))}
            placeholder="Oui, Non, Partiellement, Ne sait pas" style={S.input} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button onClick={onSave} disabled={saving} style={{ ...S.btn(accent), padding: '9px 20px', fontWeight: 700 }}>
          {saving ? '...' : '✓ Enregistrer'}
        </button>
        <button onClick={onCancel} style={S.btn('#EF4444')}>✕ Annuler</button>
      </div>
    </div>
  )

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: notification.type === 'success' ? '#10B98133' : '#EF444433', border: `1px solid ${notification.type === 'success' ? '#10B981' : '#EF4444'}`, color: notification.type === 'success' ? '#10B981' : '#EF4444', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
          {notification.type === 'success' ? '✓ ' : '⚠ '}{notification.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Gestion des questions</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{questions.length} questions — modifiable par les intervenants uniquement</p>
        </div>
        <button onClick={() => { setShowAdd(p=>!p); setEditId(null) }}
          style={{ ...S.btn('#F59E0B'), padding: '10px 20px', fontSize: 13, fontWeight: 700 }}>
          {showAdd ? '✕ Annuler' : '+ Nouvelle question'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ ...S.card, borderColor: '#F59E0B55', marginBottom: 28 }}>
          <div style={S.title}>Nouvelle question</div>
          <FormBlock data={newQ} setData={setNewQ} onSave={handleAdd} onCancel={() => setShowAdd(false)} accent="#F59E0B" />
        </div>
      )}

      {/* Questions by pillar */}
      {CORE_DRIVES.map(cd => {
        const cdQs = questions.filter(q => q.pillar === cd.id)
        if (!cdQs.length) return null
        return (
          <div key={cd.id} style={{ ...S.card, borderLeft: `3px solid ${cd.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 18, color: cd.color }}>{cd.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: cd.color }}>{cd.label}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{cdQs.length} question(s)</div>
              </div>
            </div>
            {cdQs.map((q, qi) => (
              <div key={q.id}>
                {editId === q.id ? (
                  <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                    <FormBlock
                      data={editData}
                      setData={setEditData}
                      onSave={handleUpdate}
                      onCancel={() => { setEditId(null); setEditData(null) }}
                      accent="#3B82F6" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: qi > 0 ? '1px solid #1e293b' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 8, lineHeight: 1.5 }}>{q.text}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ background: '#1e293b', color: '#64748b', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace' }}>{q.type}</span>
                        <span style={{ background: '#1e293b', color: '#64748b', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace' }}>{q.target_role}</span>
                        <span style={{ fontSize: 11, color: '#475569' }}>{responses.filter(r => r.question_id === q.id).length} rép.</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setEditId(q.id); setEditData({ ...q, options: Array.isArray(q.options) ? q.options.join(', ') : '' }) }} style={S.btn('#3B82F6')}>✎</button>
                      <button onClick={() => handleDelete(q.id)} style={S.btn('#EF4444')}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
