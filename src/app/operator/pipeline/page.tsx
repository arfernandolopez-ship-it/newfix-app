import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate } from '@/lib/utils'
import { ETAPAS, TrabajoEtapa } from '@/types'
import Link from 'next/link'

export default async function PipelinePage() {
  const supabase = createClient()
  const { data: trabajos } = await supabase
    .from('trabajos')
    .select('*, cliente:clientes(nombre, rubro)')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  const byEtapa = (etapa: TrabajoEtapa) =>
    (trabajos || []).filter((t: any) => t.etapa === etapa)

  const ETAPA_COLORS: Record<TrabajoEtapa, string> = {
    llamado:     '#94A3B8',
    visita:      '#2563EB',
    presupuesto: '#7C3AED',
    trabajo:     '#D97706',
    factura:     '#0BA89A',
    cobro:       '#059669',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Pipeline de trabajos</div>
          <div className="text-xs text-slate-400">Llamado → Visita → Presupuesto → Trabajo → Factura → Cobro</div>
        </div>
        <Link href="/operator/pipeline/nuevo" className="btn btn-teal btn-sm">+ Nuevo trabajo</Link>
      </div>

      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-3 min-w-max h-full">
          {ETAPAS.map(etapa => {
            const items = byEtapa(etapa.key)
            return (
              <div key={etapa.key} className="w-52 flex flex-col bg-slate-100 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{etapa.emoji}</span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{etapa.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {items.map((t: any) => (
                    <Link key={t.id} href={`/operator/pipeline/${t.id}`}>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                        style={{ borderLeftWidth: 3, borderLeftColor: ETAPA_COLORS[t.etapa as TrabajoEtapa] }}>
                        <div className="text-xs font-semibold text-slate-900 leading-snug mb-1">{t.titulo}</div>
                        <div className="text-[10px] text-slate-400 mb-2">{t.cliente?.nombre} · {t.cliente_final}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{t.fecha_visita ? fmtDate(t.fecha_visita) : '—'}</span>
                          {t.monto && (
                            <span className="text-xs font-bold text-green-600 font-mono">${fmt(t.monto)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {items.length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center text-[11px] text-slate-400">
                      Sin trabajos
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
