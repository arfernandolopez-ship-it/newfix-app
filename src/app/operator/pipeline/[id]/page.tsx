'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { fmt, fmtDate } from '@/lib/utils'
import { ETAPAS } from '@/types'
import Link from 'next/link'

const ETAPA_LIST = ['llamado', 'visita', 'presupuesto', 'trabajo', 'factura', 'cobro']

export default function TrabajoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [trabajo, setTrabajo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('trabajos')
      .select('*, cliente:clientes(nombre, rubro, plan)')
      .eq('id', params.id)
      .single()
      .then(({ data }) => { setTrabajo(data); setLoading(false) })
  }, [params.id])

  async function avanzarEtapa() {
    const idx = ETAPA_LIST.indexOf(trabajo.etapa)
    if (idx >= ETAPA_LIST.length - 1) return
    const nuevaEtapa = ETAPA_LIST[idx + 1]
    setSaving(true)
    await supabase.from('trabajos').update({ etapa: nuevaEtapa }).eq('id', params.id)
    setTrabajo((t: any) => ({ ...t, etapa: nuevaEtapa }))
    setSaving(false)
  }

  async function completarTrabajo() {
    setSaving(true)
    await supabase.from('trabajos').update({ estado: 'completado' }).eq('id', params.id)
    router.push('/operator/pipeline')
  }

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400">Cargando...</div>
  if (!trabajo) return <div className="flex items-center justify-center h-full text-slate-400">Trabajo no encontrado</div>

  const etapaIdx = ETAPA_LIST.indexOf(trabajo.etapa)
  const etapaInfo = ETAPAS.find(e => e.key === trabajo.etapa)
  const isLast = etapaIdx >= ETAPA_LIST.length - 1

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
        <Link href="/operator/pipeline" className="btn btn-ghost btn-sm">← Pipeline</Link>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-900 truncate">{trabajo.titulo}</div>
          <div className="text-xs text-slate-400">{trabajo.cliente?.nombre}{trabajo.cliente_final ? ` · ${trabajo.cliente_final}` : ''}</div>
        </div>
        <span className="badge badge-blue text-xs">{etapaInfo?.emoji} {etapaInfo?.label}</span>
        {trabajo.estado === 'activo' && (
          <button onClick={avanzarEtapa} disabled={isLast || saving} className="btn btn-teal btn-sm">
            {isLast ? '✓ Última etapa' : `→ ${ETAPAS[etapaIdx + 1]?.label}`}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            {/* Flujo de etapas */}
            <div className="card">
              <div className="card-head"><span className="card-title">Progreso</span></div>
              <div className="card-body">
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
            </div>

            {/* Datos */}
            <div className="card">
              <div className="card-head"><span className="card-title">Detalles</span></div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="info-row"><span className="info-key">Cliente NewFix</span><span className="info-val font-semibold">{trabajo.cliente?.nombre}</span></div>
                  <div className="info-row"><span className="info-key">Cliente final</span><span className="info-val">{trabajo.cliente_final || '—'}</span></div>
                  <div className="info-row"><span className="info-key">Monto</span><span className="info-val font-mono font-bold text-green-600">{trabajo.monto ? `$${fmt(trabajo.monto)}` : '—'}</span></div>
                  <div className="info-row"><span className="info-key">Fecha visita</span><span className="info-val">{fmtDate(trabajo.fecha_visita)}</span></div>
                  <div className="info-row"><span className="info-key">Estado</span><span className={`badge ${trabajo.estado === 'activo' ? 'badge-ok' : 'badge-gray'}`}>{trabajo.estado}</span></div>
                  <div className="info-row"><span className="info-key">Creado</span><span className="info-val">{fmtDate(trabajo.created_at)}</span></div>
                </div>
                {trabajo.descripcion && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-400 mb-1">Descripción</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{trabajo.descripcion}</p>
                  </div>
                )}
                {trabajo.notas && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-400 mb-1">Notas internas</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{trabajo.notas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="card-head"><span className="card-title">Acciones</span></div>
              <div className="card-body space-y-2">
                {trabajo.estado === 'activo' && !isLast && (
                  <button onClick={avanzarEtapa} disabled={saving} className="btn btn-teal w-full text-sm">
                    → Avanzar a {ETAPAS[etapaIdx + 1]?.label}
                  </button>
                )}
                {trabajo.estado === 'activo' && trabajo.etapa === 'cobro' && (
                  <button onClick={completarTrabajo} disabled={saving} className="btn btn-teal w-full text-sm">
                    ✓ Marcar como completado
                  </button>
                )}
                <Link href={`/operator/clientes/${trabajo.cliente_id}`} className="btn btn-ghost w-full text-sm">
                  Ver ficha del cliente
                </Link>
                <Link href={`/operator/facturas/nueva?trabajo=${trabajo.id}&cliente=${trabajo.cliente_id}`} className="btn btn-ghost w-full text-sm">
                  Generar factura
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Cliente</span></div>
              <div className="card-body">
                <div className="info-row"><span className="info-key">Empresa</span><span className="info-val font-semibold">{trabajo.cliente?.nombre}</span></div>
                <div className="info-row"><span className="info-key">Rubro</span><span className="info-val">{trabajo.cliente?.rubro}</span></div>
                <div className="info-row"><span className="info-key">Plan</span><span className={`badge badge-${trabajo.cliente?.plan}`}>{trabajo.cliente?.plan}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
