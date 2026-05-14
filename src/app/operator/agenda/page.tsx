import { createClient } from '@/lib/supabase/server'
import { fmtDate } from '@/lib/utils'
import { ETAPAS } from '@/types'
import Link from 'next/link'

const ETAPA_COLORS: Record<string, string> = {
  llamado: '#94A3B8', visita: '#2563EB', presupuesto: '#7C3AED',
  trabajo: '#D97706', factura: '#0BA89A', cobro: '#059669',
}

export default async function AgendaPage() {
  const supabase = createClient()
  const { data: trabajos } = await supabase
    .from('trabajos')
    .select('*, cliente:clientes(nombre)')
    .eq('estado', 'activo')
    .not('fecha_visita', 'is', null)
    .order('fecha_visita')

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const proximos = (trabajos || []).filter((t: any) => new Date(t.fecha_visita) >= hoy)
  const pasados  = (trabajos || []).filter((t: any) => new Date(t.fecha_visita) < hoy)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Agenda</div>
          <div className="text-xs text-slate-400">{proximos.length} visitas próximas</div>
        </div>
        <Link href="/operator/pipeline/nuevo" className="btn btn-teal btn-sm">+ Nueva visita</Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {proximos.length === 0 && pasados.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            <div className="text-3xl mb-3">📅</div>
            Sin visitas agendadas
          </div>
        )}

        {proximos.length > 0 && (
          <>
            <div className="font-display text-sm font-bold text-slate-900 mb-3">Próximas visitas</div>
            <div className="space-y-2 mb-6">
              {proximos.map((t: any) => {
                const etapa = ETAPAS.find(e => e.key === t.etapa)
                const color = ETAPA_COLORS[t.etapa] || '#94A3B8'
                return (
                  <Link key={t.id} href={`/operator/pipeline/${t.id}`}>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-4"
                      style={{ borderLeftWidth: 4, borderLeftColor: color }}>
                      <div className="text-center min-w-[52px]">
                        <div className="font-display text-xl font-extrabold text-slate-900 leading-none">
                          {new Date(t.fecha_visita).getDate()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {new Date(t.fecha_visita).toLocaleDateString('es-AR', { month: 'short' })}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{t.titulo}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {t.cliente?.nombre}{t.cliente_final ? ` · ${t.cliente_final}` : ''}
                        </div>
                      </div>
                      <span className="text-lg">{etapa?.emoji}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {pasados.length > 0 && (
          <>
            <div className="font-display text-sm font-bold text-slate-400 mb-3">Visitas pasadas</div>
            <div className="space-y-2 opacity-50">
              {pasados.slice(0, 5).map((t: any) => {
                const etapa = ETAPAS.find(e => e.key === t.etapa)
                return (
                  <Link key={t.id} href={`/operator/pipeline/${t.id}`}>
                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                      <div className="text-sm text-slate-400">{fmtDate(t.fecha_visita)}</div>
                      <div className="flex-1 text-sm font-medium text-slate-600">{t.titulo}</div>
                      <span className="text-sm">{etapa?.emoji}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
