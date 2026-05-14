import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate, daysUntil, computeSyhEstado } from '@/lib/utils'
import { ETAPAS } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [
    { data: cliente },
    { data: trabajos },
    { data: facturas },
    { data: compliance },
  ] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', params.id).single(),
    supabase.from('trabajos').select('*').eq('cliente_id', params.id).order('created_at', { ascending: false }),
    supabase.from('facturas').select('*').eq('cliente_id', params.id).order('fecha_emision', { ascending: false }),
    supabase.from('compliance').select('*').eq('cliente_id', params.id),
  ])

  if (!cliente) notFound()

  const COLORS: Record<string, string> = { 'G': '#2563EB', 'P': '#7C3AED', 'T': '#059669', 'F': '#DC2626' }
  const avatarBg = COLORS[cliente.nombre[0]] || '#64748B'

  const syhEstado = computeSyhEstado(cliente.vence_syh, cliente.estado_syh)
  const syhClass = syhEstado === 'ok' ? 'badge-ok' : syhEstado === 'warn' ? 'badge-warn' : 'badge-risk'
  const syhLabel = syhEstado === 'ok' ? 'SyH Vigente' : syhEstado === 'warn' ? 'SyH por vencer' : 'SyH vencido'

  return (
    <div className="flex flex-col h-full">
      {/* TOPBAR */}
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
        <Link href="/operator/clientes" className="btn btn-ghost btn-sm">← Volver</Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: avatarBg }}>
          {cliente.nombre.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-900">{cliente.nombre}</div>
          <div className="text-xs text-slate-400">{cliente.rubro} · Plan {cliente.plan.charAt(0).toUpperCase() + cliente.plan.slice(1)}</div>
        </div>
        <span className={`badge ${syhClass} text-xs px-3 py-1`}>{syhLabel}</span>
        <Link href={`/operator/pipeline/nuevo?cliente=${params.id}`} className="btn btn-teal btn-sm">+ Trabajo</Link>
        <Link href={`/operator/clientes/${params.id}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-5">
          {/* LEFT: Info + Trabajos */}
          <div className="col-span-2 space-y-4">
            {/* Info */}
            <div className="card">
              <div className="card-head"><span className="card-title">Datos del cliente</span></div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="info-row"><span className="info-key">Teléfono</span><span className="info-val">{cliente.telefono || '—'}</span></div>
                  <div className="info-row"><span className="info-key">Email</span><span className="info-val text-sm">{cliente.email || '—'}</span></div>
                  <div className="info-row"><span className="info-key">CUIT</span><span className="info-val font-mono">{cliente.cuit || '—'}</span></div>
                  <div className="info-row"><span className="info-key">Plan</span><span className={`badge badge-${cliente.plan}`}>{cliente.plan.charAt(0).toUpperCase() + cliente.plan.slice(1)}</span></div>
                  <div className="info-row"><span className="info-key">Facturación est.</span><span className="info-val text-green-600 font-mono">${fmt(cliente.facturacion_estimada)}/mes</span></div>
                  <div className="info-row"><span className="info-key">Cliente desde</span><span className="info-val">{fmtDate(cliente.created_at)}</span></div>
                </div>
              </div>
            </div>

            {/* Trabajos */}
            <div className="card">
              <div className="card-head">
                <span className="card-title">Trabajos</span>
                <Link href={`/operator/pipeline/nuevo?cliente=${params.id}`} className="btn btn-ghost btn-sm">+ Nuevo</Link>
              </div>
              <div className="card-body space-y-3">
                {(trabajos || []).map((t: any) => {
                  const etapaIdx = ETAPAS.findIndex(e => e.key === t.etapa)
                  return (
                    <Link key={t.id} href={`/operator/pipeline/${t.id}`}>
                      <div className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{t.titulo}</div>
                            {t.cliente_final && <div className="text-xs text-slate-400 mt-0.5">Cliente: {t.cliente_final}</div>}
                          </div>
                          {t.monto && <span className="text-sm font-bold text-green-600 font-mono">${fmt(t.monto)}</span>}
                        </div>
                        {/* Flow stepper */}
                        <div className="flow-wrap">
                          {ETAPAS.map((e, idx) => (
                            <div key={e.key} className={`flow-step ${idx < etapaIdx ? 'done' : idx === etapaIdx ? 'active' : ''}`}>
                              {idx < ETAPAS.length - 1 && (
                                <div className={`absolute top-[10px] left-[55%] w-[90%] h-0.5 z-0 ${idx < etapaIdx ? 'bg-green-500' : 'bg-slate-200'}`} />
                              )}
                              <div className={`flow-dot ${idx < etapaIdx ? 'flow-dot-done' : idx === etapaIdx ? 'flow-dot-active' : ''}`}>
                                {idx < etapaIdx ? '✓' : idx + 1}
                              </div>
                              <div className={`flow-lbl ${idx < etapaIdx ? 'flow-lbl-done' : idx === etapaIdx ? 'flow-lbl-active' : ''}`}>{e.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {(trabajos || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin trabajos registrados</p>
                )}
              </div>
            </div>

            {/* Facturas */}
            <div className="card">
              <div className="card-head">
                <span className="card-title">Facturas</span>
                <Link href={`/operator/facturas/nueva?cliente=${params.id}`} className="btn btn-ghost btn-sm">+ Nueva</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {(facturas || []).map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-slate-900">{f.numero}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{fmtDate(f.fecha_emision)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">${fmt(f.monto)}</div>
                      <span className={`badge ${f.estado === 'cobrada' ? 'badge-ok' : f.estado === 'atrasada' ? 'badge-risk' : 'badge-warn'}`}>
                        {f.estado.charAt(0).toUpperCase() + f.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {(facturas || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin facturas</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Estado + Acciones + Compliance */}
          <div className="space-y-4">
            <div className="card">
              <div className="card-head"><span className="card-title">Estado rápido</span></div>
              <div className="card-body">
                <div className="info-row"><span className="info-key">SyH</span><span className={`badge ${syhClass}`}>{syhLabel}</span></div>
                <div className="info-row"><span className="info-key">ART</span><span className="info-val text-sm">{cliente.art}</span></div>
                <div className="info-row"><span className="info-key">Habilitación</span><span className="info-val text-sm">{cliente.habilitacion}</span></div>
                <div className="info-row"><span className="info-key">ISO 9001</span><span className="info-val text-sm">{cliente.iso_estado}</span></div>
                {cliente.vence_syh && (
                  <div className="info-row">
                    <span className="info-key">Vence SyH</span>
                    <span className={`info-val text-sm ${(daysUntil(cliente.vence_syh) || 0) < 30 ? 'text-amber-600' : ''}`}>
                      {fmtDate(cliente.vence_syh)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Acciones</span></div>
              <div className="card-body space-y-2">
                <button className="btn btn-teal w-full text-sm">Recordatorio de cobro</button>
                <button className="btn btn-ghost w-full text-sm">Programar renovación SyH</button>
                <button className="btn btn-ghost w-full text-sm">Generar informe PDF</button>
                <button className="btn btn-ghost w-full text-sm">WhatsApp al cliente</button>
              </div>
            </div>

            {cliente.notas && (
              <div className="card">
                <div className="card-head"><span className="card-title">Notas</span></div>
                <div className="card-body">
                  <p className="text-sm text-slate-600 leading-relaxed">{cliente.notas}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
