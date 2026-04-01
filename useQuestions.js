import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useQuestions() {
  const { profile } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
    if (error) setError(error.message)
    else setQuestions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  // Filtrer selon le rôle
  const myQuestions = questions.filter(q =>
    q.target_role === 'all' || q.target_role === profile?.role
  )

  async function addQuestion(payload) {
    const { data, error } = await supabase
      .from('questions')
      .insert([{ ...payload, created_by: profile.id }])
      .select()
      .single()
    if (!error) setQuestions(prev => [...prev, data])
    return { data, error }
  }

  async function updateQuestion(id, payload) {
    const { data, error } = await supabase
      .from('questions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error) setQuestions(prev => prev.map(q => q.id === id ? data : q))
    return { data, error }
  }

  async function deleteQuestion(id) {
    // Soft delete
    const { error } = await supabase
      .from('questions')
      .update({ active: false })
      .eq('id', id)
    if (!error) setQuestions(prev => prev.filter(q => q.id !== id))
    return { error }
  }

  return { questions, myQuestions, loading, error, addQuestion, updateQuestion, deleteQuestion, refetch: fetchQuestions }
}
