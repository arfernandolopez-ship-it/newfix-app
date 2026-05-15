'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ETAPAS } from '@/types'
import Link from 'next/link'

function NuevoTrabajoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<any[]>([])

  const [form, setForm] = useState({
    cliente_id: searchParams.get('cliente') || '',
    titulo: '',
    cliente_final: '',
    descripcion: '',
    etapa: 'llamado',
    monto: '',
    fecha_visita: '',
    notas: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre')
      .then(({ data }) => setClientes(data || []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es obligatorio'); return }
    if (!form.cliente_id) { setError('Seleccioná un cliente'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('trabajos').insert({
      cliente_id: form.cliente_id,
      titulo: form.titulo.trim(),
      cliente_final: form.cliente_final || null,
      descripcion: form.descripcion || null,
      etapa: form.etapa,
      estado: 'activo',
      monto: form.monto ? Number(form.monto) : null,
      fecha_visita: form.fecha_visita || null,
      notas: form.notas || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/operator/pipeline')
    router.refresh()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="card">
          <div className="card-head"><span className="card-title">Datos del trabajo</span></div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Cliente NewFix *</label>
              <select className="input" value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)} required>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Título del trabajo *</label>
              <input className="input" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Instalación tablero eléctrico Planta Norte" required />
            </div>
            <div>
              <label className="label">Cliente final / Ubicación</label>
              <input className="input" value={form.cliente_final} onChange={e => set('cliente_final', e.target.value)} placeholder="Ej: Edificio Don Carlos - Oficina 3" />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="input min-h-[80px]" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Detalle del trabajo a realizar..." />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Estado y fechas</span></div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Etapa inicial</label>
                <select className="input" value={form.etapa} onChange={e => set('etapa', e.target.value)}>
                  {ETAPAS.map(e => (
                    <option key={e.key} value={e.key}>{e.emoji} {e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Monto estimado ($)</label>
                <input className="input font-mono" type="number" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="120000" />
              </div>
            </div>
            <div>
              <label className="label">Fecha de visita</label>
              <input className="input" type="date" value={form.fecha_visita} onChange={e => set('fecha_visita', e.target.value)} />
            </div>
            <div>
              <label className="label">Notas internas</label>
              <textarea className="input min-h-[60px]" value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-teal btn-lg px-8">
            {loading ? 'Guardando...' : 'Crear trabajo'}
          </button>
          <Link href="/operator/pipeline" className="btn btn-ghost btn-lg px-6">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}

export default function NuevoTrabajoPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
        <Link href="/operator/pipeline" className="btn btn-ghost btn-sm">← Volver</Link>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-900">Nuevo trabajo</div>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Cargando...</div>}>
        <NuevoTrabajoForm />
      </Suspense>
    </div>
  )
}
