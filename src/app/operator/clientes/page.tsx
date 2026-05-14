import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { fmtDate } from '@/lib/utils'

export default async function ClientesPage() {
  const supabase = createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const COLORS: Record<string, string> = {
    'G': '#2563EB', 'P': '#7C3AED', 'T': '#059669', 'F': '#DC2626',
  }
  const getColor = (nombre: string) => COLORS[nombre[0]] || '#64748B'

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Clientes</div>
          <div className="text-xs text-slate-400">{clientes?.length || 0} activos</div>
        </div>
        <Link href="/operator/clientes/nuevo" className="btn btn-teal btn-sm">+ Nuevo cliente</Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <input
              className="input flex-1 max-w-xs"
              type="text"
              placeholder="Buscar cliente..."
            />
            <div className="flex gap-2">
              {['Todos','Básico','Pro','Premium','Con alertas'].map(f => (
                <button key={f} className={`chip text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${f === 'Todos' ? 'bg-navy text-white border-navy' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Trabajos activos</th>
                <th>SyH</th>
                <th>ISO</th>
                <th>Alta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(clientes || []).map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/operator/clientes/${c.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: getColor(c.nombre) }}>
                        {c.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.nombre}</div>
                        <div className="text-xs text-slate-400">{c.rubro}</div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${c.plan} px-2 py-0.5 rounded-full`}>
                      {c.plan.charAt(0).toUpperCase() + c.plan.slice(1)}
                    </span>
                  </td>
                  <td><span className="badge badge-blue">—</span></td>
                  <td>
                    <span className={`badge ${c.estado_syh === 'ok' ? 'badge-ok' : c.estado_syh === 'warn' ? 'badge-warn' : 'badge-risk'}`}>
                      {c.estado_syh === 'ok' ? 'Vigente' : c.estado_syh === 'warn' ? 'Por vencer' : 'Vencido'}
                    </span>
                  </td>
                  <td><span className="text-xs text-slate-500">{c.iso_estado}</span></td>
                  <td><span className="text-xs text-slate-400">{fmtDate(c.created_at)}</span></td>
                  <td>
                    <Link href={`/operator/clientes/${c.id}`} className="btn btn-ghost btn-sm">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
