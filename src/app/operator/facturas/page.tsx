import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate } from '@/lib/utils'
import Link from 'next/link'

export default async function FacturasPage() {
  const supabase = createClient()
  const { data: facturas } = await supabase
    .from('facturas')
    .select('*, cliente:clientes(nombre)')
    .order('fecha_emision', { ascending: false })

  const total = (facturas || []).reduce((s: number, f: any) => s + (f.estado !== 'cobrada' ? f.monto : 0), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Facturas NewFix</div>
          <div className="text-xs text-slate-400">${fmt(total)} por cobrar</div>
        </div>
        <Link href="/operator/facturas/nueva" className="btn btn-teal btn-sm">+ Nueva factura</Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <input className="input flex-1 max-w-xs" type="text" placeholder="Buscar..." />
            <div className="flex gap-2">
              {['Todas','Atrasadas','Pendientes','Cobradas'].map(f => (
                <button key={f} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${f === 'Todas' ? 'bg-navy text-white border-navy' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Emisión</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(facturas || []).map((f: any) => (
                <tr key={f.id}>
                  <td className="font-mono font-semibold text-slate-900">{f.numero}</td>
                  <td>{f.cliente?.nombre}</td>
                  <td className="text-slate-400 text-xs">{f.concepto || '—'}</td>
                  <td className="font-mono font-bold text-slate-900">${fmt(f.monto)}</td>
                  <td className="text-xs">{fmtDate(f.fecha_emision)}</td>
                  <td className={`text-xs ${f.estado === 'atrasada' ? 'text-red-600 font-semibold' : ''}`}>
                    {fmtDate(f.fecha_vencimiento)}
                  </td>
                  <td>
                    <span className={`badge ${f.estado === 'cobrada' ? 'badge-ok' : f.estado === 'atrasada' ? 'badge-risk' : f.estado === 'pendiente' ? 'badge-warn' : 'badge-gray'}`}>
                      {f.estado.charAt(0).toUpperCase() + f.estado.slice(1)}
                    </span>
                  </td>
                  <td>
                    {f.estado !== 'cobrada' && (
                      <button className="btn btn-ghost btn-sm text-xs">
                        {f.estado === 'atrasada' ? 'Recordar' : 'Cobrar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(facturas || []).length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Sin facturas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
