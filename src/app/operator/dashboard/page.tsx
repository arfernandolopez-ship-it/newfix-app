import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate, daysUntil } from '@/lib/utils'
import { AlertTriangle, Users, Wrench, DollarSign, Shield } from 'lucide-react'
import Link from 'next/link'
import { Cliente, Tarea, Factura, Compliance } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { data: clientes },
    { data: tareas },
    { data: facturas },
    { data: trabajos },
    { data: compliance },
  ] = await Promise.all([
    supabase.from('clientes').select('*').eq('activo', true).order('created_at'),
    supabase.from('tareas').select('*, cliente:clientes(nombre)').eq('completada', false).order('fecha_limite'),
    supabase.from('facturas').select('*, cliente:clientes(nombre)').neq('estado', 'cobrada').order('created_at', { ascending: false }),
    supabase.from('trabajos').select('*, cliente:clientes(nombre)').eq('estado', 'activo'),
    supabase.from('cumplimiento').select('*, cliente:clientes(nombre)').neq('estado', 'renovado'),
  ])

  const totalPorCobrar = (facturas || []).reduce((s: number, f: any) => s + f.monto, 0)
  const alertasSyh = (clientes || []).filter((c: any) => c.estado_syh !== 'ok')
  const tareasUrgentes = (tareas || []).filter((t: any) => t.prioridad === 'alta')
  const trabajosActivos = (trabajos || []).length

  return (
    <div className="flex flex-col h-full">
      {/* TOPBAR */}
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Dashboard</div>
          <div className="text-xs text-slate-400">Resumen general</div>
        </div>
        <div className="flex gap-2">
          <Link href="/operator/clientes/nuevo" className="btn btn-teal btn-sm">
            + Cliente
          </Link>
          <Link href="/operator/pipeline/nuevo" className="btn btn-ghost btn-sm">
            + Trabajo
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Link href="/operator/clientes">
            <div className="card p-5 hover:border-teal transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal" />
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Clientes activos</div>
              <div className="font-display text-3xl font-extrabold text-slate-900 leading-none">{clientes?.length || 0}</div>
              <div className="text-xs text-green-600 font-medium mt-1.5">+1 este mes</div>
              <Users size={18} className="absolute right-4 top-4 text-teal opacity-60" />
            </div>
          </Link>
          <Link href="/operator/pipeline">
            <div className="card p-5 hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Trabajos activos</div>
              <div className="font-display text-3xl font-extrabold text-slate-900 leading-none">{trabajosActivos}</div>
              <div className="text-xs text-slate-400 font-medium mt-1.5">entre todos los clientes</div>
              <Wrench size={18} className="absolute right-4 top-4 text-blue-500 opacity-60" />
            </div>
          </Link>
          <Link href="/operator/facturas">
            <div className="card p-5 hover:border-amber-400 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Por cobrar</div>
              <div className="font-display text-3xl font-extrabold text-slate-900 leading-none">${Math.round(totalPorCobrar / 1000)}k</div>
              <div className="text-xs text-amber-600 font-medium mt-1.5">{facturas?.length || 0} facturas</div>
              <DollarSign size={18} className="absolute right-4 top-4 text-amber-500 opacity-60" />
            </div>
          </Link>
          <Link href="/operator/compliance">
            <div className="card p-5 hover:border-red-400 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Alertas SyH</div>
              <div className="font-display text-3xl font-extrabold text-slate-900 leading-none">{alertasSyh.length}</div>
              <div className="text-xs text-red-600 font-medium mt-1.5">requieren acción</div>
              <Shield size={18} className="absolute right-4 top-4 text-red-500 opacity-60" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Alertas */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm font-bold text-slate-900">Alertas activas</span>
              <Link href="/operator/compliance" className="text-xs text-teal font-medium hover:text-teal2">Ver todas →</Link>
            </div>
            <div className="space-y-2 mb-5">
              {alertasSyh.length === 0 && (
                <div className="card p-4 text-sm text-slate-400 text-center">Sin alertas activas ✓</div>
              )}
              {alertasSyh.map((c: any) => (
                <Link key={c.id} href={`/operator/clientes/${c.id}`}>
                  <div className={`flex items-center gap-3 bg-white border rounded-xl p-3 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${c.estado_syh === 'risk' ? 'border-l-red-500' : 'border-l-amber-400'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.estado_syh === 'risk' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{c.nombre}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {c.estado_syh === 'risk' ? 'SyH o ART vencida — gestionar urgente' : `SyH vence ${fmtDate(c.vence_syh)}`}
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${c.estado_syh === 'risk' ? 'text-red-600' : 'text-amber-600'}`}>
                      {c.estado_syh === 'risk' ? 'URGENTE' : `${daysUntil(c.vence_syh)} días`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Clientes recientes */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm font-bold text-slate-900">Clientes</span>
              <Link href="/operator/clientes" className="text-xs text-teal font-medium hover:text-teal2">Ver todos →</Link>
            </div>
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Plan</th>
                    <th>SyH</th>
                    <th>Cobros pend.</th>
                  </tr>
                </thead>
                <tbody>
                  {(clientes || []).slice(0, 5).map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/operator/clientes/${c.id}`} className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                            style={{ background: c.nombre.startsWith('G') ? '#2563EB' : c.nombre.startsWith('P') ? '#7C3AED' : c.nombre.startsWith('T') ? '#059669' : '#DC2626' }}>
                            {c.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{c.nombre}</div>
                            <div className="text-xs text-slate-400">{c.rubro}</div>
                          </div>
                        </Link>
                      </td>
                      <td><span className={`badge badge-${c.plan} px-2 py-0.5 rounded-full`}>{c.plan.charAt(0).toUpperCase() + c.plan.slice(1)}</span></td>
                      <td><span className={`badge ${c.estado_syh === 'ok' ? 'badge-ok' : c.estado_syh === 'warn' ? 'badge-warn' : 'badge-risk'}`}>
                        {c.estado_syh === 'ok' ? 'OK' : c.estado_syh === 'warn' ? 'Por vencer' : 'Vencido'}
                      </span></td>
                      <td><span className="font-mono text-xs text-slate-600">—</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tareas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-sm font-bold text-slate-900">Tareas urgentes</span>
              <Link href="/operator/tareas" className="text-xs text-teal font-medium hover:text-teal2">Ver todas →</Link>
            </div>
            <div className="card">
              <div className="p-3 space-y-0">
                {(tareas || []).slice(0, 6).map((t: any) => (
                  <TareaItem key={t.id} tarea={t} />
                ))}
                {(tareas || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-3">Sin tareas pendientes ✓</p>
                )}
              </div>
            </div>

            {/* Estado clientes */}
            <div className="flex items-center justify-between mb-3 mt-5">
              <span className="font-display text-sm font-bold text-slate-900">Estado SyH</span>
            </div>
            <div className="card">
              <div className="p-3 space-y-0">
                {(clientes || []).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                      style={{ background: c.nombre.startsWith('G') ? '#2563EB' : c.nombre.startsWith('P') ? '#7C3AED' : c.nombre.startsWith('T') ? '#059669' : '#DC2626' }}>
                      {c.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{c.nombre.split(' ')[0]}</span>
                    <span className={`badge ${c.estado_syh === 'ok' ? 'badge-ok' : c.estado_syh === 'warn' ? 'badge-warn' : 'badge-risk'}`}>
                      {c.estado_syh === 'ok' ? 'OK' : c.estado_syh === 'warn' ? 'Próximo' : 'Vencido'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TareaItem({ tarea }: { tarea: any }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
      <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 ${tarea.completada ? 'bg-green-600 border-green-600' : 'border-slate-200'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-800 leading-snug">{tarea.texto}</div>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {tarea.prioridad === 'alta' && <span className="text-[10px] text-red-600 font-semibold">Urgente</span>}
          {tarea.cliente?.nombre && <span className="text-[10px] text-teal font-medium">{tarea.cliente.nombre.split(' ')[0]}</span>}
        </div>
      </div>
    </div>
  )
}
