import { createClient } from '@/lib/supabase/server'
import { fmt, fmtDate, daysUntil } from '@/lib/utils'
import { ETAPAS } from '@/types'
import Link from 'next/link'

export default async function ClientInicioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get client profile
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('*, cliente:clientes(*)')
    .eq('user_id', user?.id)
    .single()

  const cliente = clientUser?.cliente as any
  if (!cliente) return <div className="p-4 text-slate-500">Error cargando datos</div>

  const [{ data: trabajos }, { data: facturas }] = await Promise.all([
    supabase.from('trabajos').select('*').eq('cliente_id', cliente.id).eq('estado', 'activo').order('created_at', { ascending: false }),
    supabase.from('facturas').select('*').eq('cliente_id', cliente.id).neq('estado', 'cobrada'),
  ])

  const totalCobrar = (facturas || []).reduce((s: number, f: any) => s + f.monto, 0)
  const syhDays = daysUntil(cliente.vence_syh)

  return (
    <div>
      {/* Header */}
      <div className="bg-navy px-5 pt-2 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="font-display text-[20px] font-extrabold text-white tracking-tight">
            New<span className="text-teal2">Fix</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white">
            {cliente.nombre.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="text-white/40 text-xs mb-1">Buen día 👋</div>
        <div className="font-display text-[20px] font-bold text-white">{cliente.nombre}</div>
      </div>

      {/* KPI Strip */}
      <div className="bg-navy flex gap-2 px-4 pb-4">
        {[
          { label: 'Trabajos', value: trabajos?.length || 0, sub: 'activos' },
          { label: 'A cobrar', value: `$${Math.round(totalCobrar / 1000)}k`, sub: `${facturas?.length || 0} pendientes` },
          { label: 'SyH', value: syhDays !== null ? (syhDays < 0 ? '⚠' : `${syhDays}d`) : '—', sub: syhDays !== null && syhDays < 30 ? 'revisar' : 'vigente' },
        ].map((k) => (
          <div key={k.label} className="flex-1 bg-white/7 border border-white/10 rounded-xl p-2.5 text-center">
            <div className="font-display text-[18px] font-bold text-white leading-none">{k.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide mt-1">{k.label}</div>
            <div className="text-[10px] text-teal2 font-medium mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* SyH alert */}
        {cliente.estado_syh !== 'ok' && (
          <div className={`flex items-start gap-2.5 rounded-xl p-3 border ${
            cliente.estado_syh === 'risk' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white flex-shrink-0 ${
              cliente.estado_syh === 'risk' ? 'bg-red-500' : 'bg-amber-500'
            }`}>🛡</div>
            <div>
              <div className={`text-xs font-semibold ${cliente.estado_syh === 'risk' ? 'text-red-800' : 'text-amber-800'}`}>
                {cliente.estado_syh === 'risk' ? 'SyH o ART vencida' : `SyH vence en ${syhDays} días`}
              </div>
              <div className={`text-[11px] mt-0.5 ${cliente.estado_syh === 'risk' ? 'text-red-700' : 'text-amber-700'}`}>
                Tu equipo NewFix está gestionando la renovación.
              </div>
            </div>
          </div>
        )}

        {/* Trabajos activos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Mis trabajos activos</span>
            <Link href="/client/trabajos" className="text-xs text-teal font-medium">Ver todos →</Link>
          </div>
          {(trabajos || []).slice(0, 2).map((t: any) => (
            <TrabajoCard key={t.id} trabajo={t} />
          ))}
          {(trabajos || []).length === 0 && (
            <div className="text-center py-4 text-sm text-slate-400">Sin trabajos activos</div>
          )}
        </div>

        {/* A cobrar */}
        {(facturas || []).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">A cobrar</span>
              <Link href="/client/cobros" className="text-xs text-teal font-medium">Ver →</Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {(facturas || []).slice(0, 2).map((f: any) => (
                <div key={f.id} className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0">💰</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{f.concepto || f.numero}</div>
                    <div className="text-xs text-slate-400">Factura enviada</div>
                  </div>
                  <span className="font-mono font-bold text-amber-600">${fmt(f.monto)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact button */}
        <button className="w-full bg-navy text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
          💬 Hablar con mi equipo NewFix
        </button>
      </div>
    </div>
  )
}

function TrabajoCard({ trabajo }: { trabajo: any }) {
  const etapaIdx = ETAPAS.findIndex(e => e.key === trabajo.etapa)
  const etapaInfo = ETAPAS[etapaIdx]

  const ETAPA_BG: Record<string, string> = {
    llamado: 'bg-slate-100 text-slate-600', visita: 'bg-blue-100 text-blue-700',
    presupuesto: 'bg-purple-100 text-purple-700', trabajo: 'bg-amber-100 text-amber-700',
    factura: 'bg-teal-50 text-teal', cobro: 'bg-green-100 text-green-700',
  }

  return (
    <Link href="/client/trabajos">
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-2 cursor-pointer"
        style={{ borderLeftWidth: 3, borderLeftColor: etapaInfo?.color }}>
        <div className="flex items-start justify-between mb-1.5">
          <div className="font-semibold text-slate-900 text-sm leading-snug flex-1">{trabajo.titulo}</div>
          <span className={`badge text-[10px] ml-2 flex-shrink-0 ${ETAPA_BG[trabajo.etapa]}`}>
            {etapaInfo?.emoji} {etapaInfo?.label}
          </span>
        </div>
        {trabajo.cliente_final && (
          <div className="text-xs text-slate-400 mb-2">{trabajo.cliente_final}</div>
        )}
        {/* Mini flow */}
        <div className="flex items-center gap-0.5">
          {ETAPAS.map((e, idx) => (
            <div key={e.key} className={`h-1 flex-1 rounded-full ${idx <= etapaIdx ? (idx < etapaIdx ? 'bg-green-500' : 'bg-teal') : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-400">Paso {etapaIdx + 1} de 6</span>
          {trabajo.monto && <span className="text-xs font-bold text-green-600 font-mono">${(trabajo.monto / 1000).toFixed(0)}k</span>}
        </div>
      </div>
    </Link>
  )
}
