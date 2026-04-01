import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useResponses() {
  const { profile } = useAuth()
  const [responses, setResponses]   = useState([])
  const [myResponses, setMyResponses] = useState([])
  const [loading,  setLoading]      = useState(true)
  const [error,    setError]        = useState(null)

  const fetchAll = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    // Mes réponses
    const { data: mine } = await supabase
      .from('responses')
      .select('*, profiles(full_name, role), questions(text, pillar, type)')
      .eq('user_id', profile.id)
    setMyResponses(mine || [])

    // Toutes les réponses visibles (RLS gère les droits)
    const { data: all, error } = await supabase
      .from('responses')
      .select('*, profiles(full_name, role, email), questions(text, pillar, type, target_role)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setResponses(all || [])

    setLoading(false)
  }, [profile])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function upsertResponse({ question_id, value_num, value_text, comment }) {
    const { data, error } = await supabase
      .from('responses')
      .upsert(
        { question_id, user_id: profile.id, value_num, value_text, comment },
        { onConflict: 'question_id,user_id' }
      )
      .select()
      .single()
    if (!error) {
      setMyResponses(prev => {
        const exists = prev.find(r => r.question_id === question_id)
        return exists
          ? prev.map(r => r.question_id === question_id ? { ...r, ...data } : r)
          : [...prev, data]
      })
    }
    return { data, error }
  }

  async function submitBatch(answers) {
    // answers: [{ question_id, value_num, value_text, comment }]
    const rows = answers.map(a => ({ ...a, user_id: profile.id }))
    const { data, error } = await supabase
      .from('responses')
      .upsert(rows, { onConflict: 'question_id,user_id' })
      .select()
    if (!error) await fetchAll()
    return { data, error }
  }

  // Map questionId -> my answer
  const myAnswerMap = myResponses.reduce((acc, r) => {
    acc[r.question_id] = r
    return acc
  }, {})

  return { responses, myResponses, myAnswerMap, loading, error, upsertResponse, submitBatch, refetch: fetchAll }
}
