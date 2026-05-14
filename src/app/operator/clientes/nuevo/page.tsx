'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    rubro: '',
    plan: 'pro',
    telefono: '',
    email: '',
    cuit: '',
    facturacion_estimada: '',
    vence_syh: '',
    art: 'Vigente',
    habilitacion: 'Vigente',
    iso_estado: 'No iniciado',
    notas: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('clientes').insert({
      nombre: form.nombre.trim(),
      rubro: form.rubro.trim(),
      plan: form.plan,
      telefono: form.telefono || null,
      email: form.email || null,
      cuit: form.cuit || null,
      facturacion_estimada: Number(form.facturacion_estimada) || 0,
      vence_syh: form.vence_syh || null,
      estado_syh: 'ok',
      art: form.art,
      habilitacion: form.habilitacion,
      iso_estado: form.iso_estado,
      notas: form.notas || null,
      activo: true,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/operator/clientes')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
        <Link href="/operator/clientes" className="btn btn-ghost btn-sm">← Volver</Link>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-900">Nuevo cliente</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="card">
            <div className="card-head"><span className="card-title">Datos principales</span></div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: García Construcciones" required />
                </div>
                <div>
                  <label className="label">Rubro</label>
                  <input className="input" value={form.rubro} onChange={e => set('rubro', e.target.value)} placeholder="Ej: Electricidad" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Plan</label>
                  <select className="input" value={form.plan} onChange={e => set('plan', e.target.value)}>
                    <option value="basico">Básico</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+54 11 ..." />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contacto@empresa.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CUIT</label>
                  <input className="input font-mono" value={form.cuit} onChange={e => set('cuit', e.target.value)} placeholder="20-12345678-9" />
                </div>
                <div>
                  <label className="label">Facturación estimada ($/mes)</label>
                  <input className="input font-mono" type="number" value={form.facturacion_estimada} onChange={e => set('facturacion_estimada', e.target.value)} placeholder="150000" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><span className="card-title">Compliance</span></div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Vencimiento SyH</label>
                  <input className="input" type="date" value={form.vence_syh} onChange={e => set('vence_syh', e.target.value)} />
                </div>
                <div>
                  <label className="label">ISO 9001</label>
                  <select className="input" value={form.iso_estado} onChange={e => set('iso_estado', e.target.value)}>
                    <option>No iniciado</option>
                    <option>En proceso</option>
                    <option>Certificado</option>
                    <option>Vencido</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">ART</label>
                  <input className="input" value={form.art} onChange={e => set('art', e.target.value)} placeholder="Vigente" />
                </div>
                <div>
                  <label className="label">Habilitación</label>
                  <input className="input" value={form.habilitacion} onChange={e => set('habilitacion', e.target.value)} placeholder="Vigente" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><span className="card-title">Notas internas</span></div>
            <div className="card-body">
              <textarea className="input min-h-[80px]" value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones, contexto, etc." />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-teal btn-lg px-8">
              {loading ? 'Guardando...' : 'Crear cliente'}
            </button>
            <Link href="/operator/clientes" className="btn btn-ghost btn-lg px-6">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
