'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function NuevaFacturaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<any[]>([])

  const [form, setForm] = useState({
    cliente_id: searchParams.get('cliente') || '',
    numero: '',
    concepto: '',
    monto: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    estado: 'pendiente',
    metodo_pago: 'transferencia',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre')
      .then(({ data }) => setClientes(data || []))

    // Auto-generar número de factura
    supabase.from('facturas').select('numero').order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data && data[0]) {
          const last = data[0].numero
          const num = parseInt(last.replace('A-', '')) + 1
          setForm(f => ({ ...f, numero: `A-${String(num).padStart(5, '0')}` }))
        } else {
          setForm(f => ({ ...f, numero: 'A-00001' }))
        }
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente_id) { setError('Seleccioná un cliente'); return }
    if (!form.monto) { setError('El monto es obligatorio'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('facturas').insert({
      cliente_id: form.cliente_id,
      numero: form.numero,
      concepto: form.concepto || null,
      monto: Number(form.monto),
      fecha_emision: form.fecha_emision,
      fecha_vencimiento: form.fecha_vencimiento || null,
      estado: form.estado,
      metodo_pago: form.metodo_pago,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/operator/facturas')
    router.refresh()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="card">
          <div className="card-head"><span className="card-title">Datos de facturación</span></div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Número</label>
                <input className="input font-mono" value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="A-00001" />
              </div>
              <div>
                <label className="label">Cliente *</label>
                <select className="input" value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Concepto</label>
              <input className="input" value={form.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Ej: Instalación eléctrica Planta Norte" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monto ($) *</label>
                <input className="input font-mono" type="number" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="85000" required />
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="borrador">Borrador</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cobrada">Cobrada</option>
                  <option value="atrasada">Atrasada</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de emisión</label>
                <input className="input" type="date" value={form.fecha_emision} onChange={e => set('fecha_emision', e.target.value)} />
              </div>
              <div>
                <label className="label">Fecha de vencimiento</label>
                <input className="input" type="date" value={form.fecha_vencimiento} onChange={e => set('fecha_vencimiento', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Método de pago</label>
              <select className="input" value={form.metodo_pago} onChange={e => set('metodo_pago', e.target.value)}>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="cheque">Cheque</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-teal btn-lg px-8">
            {loading ? 'Guardando...' : 'Crear factura'}
          </button>
          <Link href="/operator/facturas" className="btn btn-ghost btn-lg px-6">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}

export default function NuevaFacturaPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
        <Link href="/operator/facturas" className="btn btn-ghost btn-sm">← Volver</Link>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-900">Nueva factura</div>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Cargando...</div>}>
        <NuevaFacturaForm />
      </Suspense>
    </div>
  )
}
