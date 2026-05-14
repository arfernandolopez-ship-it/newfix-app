'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const email = emailRef.current?.value || ''
    const password = passRef.current?.value || ''

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Email o contraseña incorrectos'); setLoading(false); return }

    // Determinar rol y redirigir con full page reload para que el middleware lea la sesión
    const { data: cu } = await supabase
      .from('usuarios_clientes')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    if (cu?.role === 'operator') window.location.replace('/operator/dashboard')
    else window.location.replace('/client/inicio')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display text-4xl font-extrabold text-white mb-1">
            New<span className="text-teal2">Fix</span>
          </div>
          <p className="text-slate-400 text-sm">Plataforma de gestión</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h1 className="font-display text-xl font-bold text-slate-900 mb-1">Ingresar</h1>
          <p className="text-sm text-slate-400 mb-5">Accedé a tu panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                ref={emailRef}
                className="input"
                type="email"
                placeholder="tu@email.com"
                defaultValue=""
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                ref={passRef}
                className="input"
                type="password"
                placeholder="••••••••"
                defaultValue=""
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-teal btn-lg w-full mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          ¿No tenés acceso? Contactá a tu equipo NewFix.
        </p>
      </div>
    </div>
  )
}
