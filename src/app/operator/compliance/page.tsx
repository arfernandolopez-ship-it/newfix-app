import { createClient } from '@/lib/supabase/server'
import { fmtDate, daysUntil } from '@/lib/utils'
import Link from 'next/link'

export default async function CompliancePage() {
  const supabase = createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('estado_syh')

  const { data: compliance } = await supabase
    .from('cumplimiento')
    .select('*, cliente:clientes(nombre)')
    .order('fecha_vencimiento')

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Compliance SyH & ISO</div>
          <div className="text-xs text-slate-400">Semáforo de cumplimiento normativo</div>
        </div>
        <button className="btn btn-ghost btn-sm">Exportar PDF</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="font-display text-sm font-bold text-slate-900 mb-3">Estado por cliente</div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(clientes || []).map((c: any) => {
            const days = daysUntil(c.vence_syh)
            const isRisk = c.estado_syh === 'risk'
            const isWarn = c.estado_syh === 'warn'
            const borderColor = isRisk ? '#DC2626' : isWarn ? '#D97706' : '#059669'
            const badgeClass = isRisk ? 'badge-risk' : isWarn ? 'badge-warn' : 'badge-ok'
            return (
              <Link key={c.id} href={`/operator/clientes/${c.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer"
                  style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">SyH</div>
                  <div className="font-bold text-slate-900 mb-1">{c.nombre}</div>
                  {c.vence_syh && <div className="text-xs text-slate-400 mb-2">Vence: {fmtDate(c.vence_syh)}</div>}
                  {days !== null && (
                    <div className={`text-sm font-bold mb-2 ${isRisk ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-green-600'}`}>
                      {days < 0 ? `${Math.abs(days)} días vencido` : `${days} días`}
                    </div>
                  )}
                  <span className={`badge ${badgeClass}`}>
                    {isRisk ? 'Vencido — gestionar ya' : isWarn ? 'Coordinar renovación' : 'Vigente'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {(compliance || []).length > 0 && (
          <>
            <div className="font-display text-sm font-bold text-slate-900 mb-3">Registros de compliance</div>
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(compliance || []).map((c: any) => {
                    const days = daysUntil(c.fecha_vencimiento)
                    return (
                      <tr key={c.id}>
                        <td className="font-semibold text-slate-900">{c.cliente?.nombre}</td>
                        <td className="uppercase text-xs font-semibold text-slate-500">{c.tipo}</td>
                        <td className="text-slate-500">{c.descripcion || '—'}</td>
                        <td>
                          <span className={days !== null && days < 30 ? 'text-amber-600 font-semibold' : ''}>
                            {fmtDate(c.fecha_vencimiento)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${c.estado === 'vigente' ? 'badge-ok' : c.estado === 'por_vencer' ? 'badge-warn' : c.estado === 'vencido' ? 'badge-risk' : 'badge-gray'}`}>
                            {c.estado.charAt(0).toUpperCase() + c.estado.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
