import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

import Login          from './components/Login'
import Layout         from './components/Layout'
import Dashboard      from './components/Dashboard'
import Questionnaire  from './components/Questionnaire'
import Results        from './components/Results'
import Responses      from './components/Responses'
import ManageQuestions from './components/ManageQuestions'

function PrivateRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#475569', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Chargement...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/questionnaire" element={
        <PrivateRoute roles={['chef_projet','operateur']}>
          <Layout><Questionnaire /></Layout>
        </PrivateRoute>
      } />
      <Route path="/results" element={
        <PrivateRoute>
          <Layout><Results /></Layout>
        </PrivateRoute>
      } />
      <Route path="/responses" element={
        <PrivateRoute roles={['intervenant','chef_projet']}>
          <Layout><Responses /></Layout>
        </PrivateRoute>
      } />
      <Route path="/manage" element={
        <PrivateRoute roles={['intervenant']}>
          <Layout><ManageQuestions /></Layout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
