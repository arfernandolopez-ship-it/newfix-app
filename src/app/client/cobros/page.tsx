import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate } from '@/lib/utils'

export default async function ClientCobrosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clientUser } = await supabase
    .from('usuarios_clientes').select('cliente_id').eq('user_id', user?.id).single()

  const { data: facturas } = await supabase
    .from('facturas').select('*').eq('cliente_id', clientUser?.cliente_id)
    .order('fecha_emision', { ascending: false })

  const pendientes = (facturas || []).filter((f: any) => f.estado !== 'cobrada')
  const cobradas = (facturas || []).filter((f: any) => f.estado === 'cobrada')
  const totalPendiente = pendientes.reduce((s: number, f: any) => s + f.monto, 0)
  const totalCobrado = cobradas.reduce((s: number, f: any) => s + f.monto, 0)

  return (
    <div>
      <div className="bg-navy px-5 pt-2 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="font-display text-[20px] font-extrabold text-white tracking-tight">New<span className="text-teal2">Fix</span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white">EP</div>
        </div>
        <div className="font-display text-[18px] font-bold text-white">Mis cobros</div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">A cobrar</div>
            <div className="font-display text-xl font-extrabold text-amber-600">${fmt(totalPendiente)}</div>
            <div className="text-[10px] text-slate-400 mt-1">{pendientes.length} facturas</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Cobrado (mes)</div>
            <div className="font-display text-xl font-extrabold text-green-600">${fmt(totalCobrado)}</div>
            <div className="text-[10px] text-slate-400 mt-1">{cobradas.length} facturas</div>
          </div>
        </div>

        {pendientes.length > 0 && (
          <>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Pendientes de cobro</div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
              {pendientes.map((f: any) => (
                <div key={f.id} className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm flex-shrink-0">⏳</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{f.concepto || f.numero}</div>
                    <div className="text-xs text-slate-400">{fmtDate(f.fecha_emision)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-600">${fmt(f.monto)}</div>
                    <span className={`badge text-[10px] ${f.estado === 'atrasada' ? 'badge-risk' : 'badge-warn'}`}>
                      {f.estado === 'atrasada' ? 'Atrasada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 mb-4">
          <span className="text-sm">💬</span>
          <div>
            <div className="text-xs font-semibold text-amber-800">¿Te pagaron?</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Avisale a NewFix para que registre el cobro y cierre la factura.</div>
          </div>
        </div>

        {cobradas.length > 0 && (
          <>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Cobradas</div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {cobradas.slice(0, 5).map((f: any) => (
                <div key={f.id} className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{f.concepto || f.numero}</div>
                    <div className="text-xs text-slate-400">{fmtDate(f.fecha_emision)}</div>
                  </div>
                  <span className="font-mono font-bold text-green-600">${fmt(f.monto)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
