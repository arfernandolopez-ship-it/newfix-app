import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate } from '@/lib/utils'
import { ETAPAS } from '@/types'
import Link from 'next/link'

const STEP_HINTS: Record<string, { title: string; desc: string; color: string; bg: string }> = {
  llamado:     { title: 'Nuevo contacto', desc: 'NewFix registró el llamado. Coordinamos la visita.', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  visita:      { title: 'Visita agendada', desc: 'Visitá al cliente para relevar el trabajo.', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  presupuesto: { title: 'Presupuesto listo', desc: 'NewFix preparó el presupuesto. Presentarlo al cliente.', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  trabajo:     { title: 'En ejecución', desc: 'Realizá el trabajo. Avisanos cuando termines para facturar.', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  factura:     { title: 'Factura enviada', desc: 'NewFix envió la factura al cliente. Esperando cobro.', color: 'text-teal', bg: 'bg-teal-50 border-teal-200' },
  cobro:       { title: '¡Listo para cobrar!', desc: 'Cuando te paguen, avisanos para cerrar el trabajo.', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
}

export default async function ClientTrabajosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('cliente_id')
    .eq('user_id', user?.id)
    .single()

  const { data: trabajos } = await supabase
    .from('trabajos')
    .select('*')
    .eq('cliente_id', clientUser?.cliente_id)
    .order('created_at', { ascending: false })

  const activos = (trabajos || []).filter((t: any) => t.estado === 'activo')
  const completados = (trabajos || []).filter((t: any) => t.estado === 'completado')

  return (
    <div>
      <div className="bg-navy px-5 pt-2 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="font-display text-[20px] font-extrabold text-white tracking-tight">New<span className="text-teal2">Fix</span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white">EP</div>
        </div>
        <div className="font-display text-[18px] font-bold text-white">Mis trabajos</div>
        <div className="text-white/40 text-xs mt-0.5">{activos.length} activos</div>
      </div>

      <div className="p-4">
        {activos.map((t: any) => {
          const etapaIdx = ETAPAS.findIndex(e => e.key === t.etapa)
          const hint = STEP_HINTS[t.etapa]
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3.5 mb-3"
              style={{ borderLeftWidth: 3, borderLeftColor: ETAPAS[etapaIdx]?.color }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="font-semibold text-slate-900 text-sm flex-1 leading-snug">{t.titulo}</div>
                <span className={`badge ml-2 flex-shrink-0 ${
                  t.etapa === 'trabajo' ? 'badge-warn' :
                  t.etapa === 'presupuesto' ? 'badge-purple' :
                  t.etapa === 'cobro' ? 'badge-ok' : 'badge-blue'
                }`}>{ETAPAS[etapaIdx]?.emoji} {ETAPAS[etapaIdx]?.label}</span>
              </div>
              {t.cliente_final && <div className="text-xs text-slate-400 mb-2.5">📍 {t.cliente_final}</div>}

              {/* 6-step flow */}
              <div className="flex items-start mb-3">
                {ETAPAS.map((e, idx) => (
                  <div key={e.key} className="flex-1 text-center relative">
                    {idx < ETAPAS.length - 1 && (
                      <div className={`absolute top-[10px] left-[55%] w-[90%] h-0.5 ${idx < etapaIdx ? 'bg-green-500' : 'bg-slate-200'}`} />
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto mb-1 text-[9px] font-bold relative z-10
                      ${idx < etapaIdx ? 'bg-green-600 border-green-600 text-white' :
                        idx === etapaIdx ? 'bg-teal border-teal text-white' :
                        'bg-white border-slate-200 text-slate-400'}`}>
                      {idx < etapaIdx ? '✓' : idx + 1}
                    </div>
                    <div className={`text-[8px] leading-tight ${idx < etapaIdx ? 'text-green-600' : idx === etapaIdx ? 'text-teal font-bold' : 'text-slate-400'}`}>
                      {e.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <div className={`rounded-lg px-2.5 py-2 border text-xs mb-2.5 ${hint.bg}`}>
                <span className={`font-semibold ${hint.color}`}>{hint.title}: </span>
                <span className="text-slate-600">{hint.desc}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{t.fecha_visita ? fmtDate(t.fecha_visita) : '—'}</span>
                {t.monto && <span className="font-mono font-bold text-green-600 text-sm">${fmt(t.monto)}</span>}
              </div>
            </div>
          )
        })}

        {activos.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">Sin trabajos activos</div>
        )}

        <button className="w-full border border-dashed border-slate-300 text-slate-400 text-sm py-3 rounded-xl mt-1">
          + Reportar nuevo trabajo
        </button>

        {completados.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Completados ({completados.length})
            </div>
            {completados.slice(0, 3).map((t: any) => (
              <div key={t.id} className="bg-white/60 border border-slate-100 rounded-xl p-3 mb-2 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{t.titulo}</span>
                  <span className="badge badge-ok text-[10px]">Completado</span>
                </div>
                {t.monto && <span className="font-mono text-xs text-green-600">${fmt(t.monto)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
