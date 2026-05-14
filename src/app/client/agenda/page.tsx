import { createClient } from '@/lib/supabase/server'
import { fmtDate } from '@/lib/utils'
import { ETAPAS } from '@/types'

export default async function ClientAgendaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: clientUser } = await supabase
    .from('usuarios_clientes').select('cliente_id').eq('user_id', user?.id).single()

  const { data: trabajos } = await supabase
    .from('trabajos').select('*').eq('cliente_id', clientUser?.cliente_id)
    .eq('estado', 'activo').order('fecha_visita')

  const ETAPA_BAR: Record<string, string> = {
    llamado:'#94A3B8',visita:'#2563EB',presupuesto:'#7C3AED',
    trabajo:'#D97706',factura:'#0BA89A',cobro:'#059669',
  }

  return (
    <div>
      <div className="bg-navy px-5 pt-2 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="font-display text-[20px] font-extrabold text-white tracking-tight">New<span className="text-teal2">Fix</span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white">EP</div>
        </div>
        <div className="font-display text-[18px] font-bold text-white">Mi agenda</div>
      </div>

      <div className="p-4">
        {(trabajos || []).length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">Sin trabajos agendados</div>
        )}

        {(trabajos || []).map((t: any) => {
          const etapa = ETAPAS.find(e => e.key === t.etapa)
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3.5 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-1 rounded-full self-stretch min-h-[40px]"
                  style={{ background: ETAPA_BAR[t.etapa] || '#94A3B8' }} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{t.titulo}</div>
                      {t.cliente_final && <div className="text-xs text-slate-400 mt-0.5">{t.cliente_final}</div>}
                    </div>
                    <span className="text-sm ml-2 flex-shrink-0">{etapa?.emoji}</span>
                  </div>
                  {t.fecha_visita && (
                    <div className="text-xs font-semibold text-slate-600 mt-2">📅 {fmtDate(t.fecha_visita)}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <div className="bg-navy rounded-xl p-4 mt-2 text-center">
          <div className="text-xs text-white/50 mb-2">¿Necesitás cambiar algo en la agenda?</div>
          <button className="w-full bg-teal text-white rounded-lg py-2.5 text-sm font-semibold">
            💬 Avisarle a NewFix
          </button>
        </div>
      </div>
    </div>
  )
}
