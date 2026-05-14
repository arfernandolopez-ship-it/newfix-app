// This page shows the professional's own clients (their customers)
// For simplicity in v1 this is a static view — in v2 it will pull from a clientes_finales table

export default function ClientClientesPage() {
  const MOCK = [
    { ini:'ER', color:'#16A34A', name:'Estudio Ruiz', type:'Oficina', status:'En ejecución', badge:'badge-warn', statusText:'En ejecución' },
    { ini:'ES', color:'#DC2626', name:'Supermercado El Sol', type:'Comercio', status:'Presupuesto', badge:'badge-purple', statusText:'Presup. enviado' },
    { ini:'LP', color:'#7C3AED', name:'La Parrilla', type:'Gastronomía', status:'A cobrar', badge:'badge-warn', statusText:'Cobrar $280k' },
    { ini:'PN', color:'#0B1829', name:'Planta Norte', type:'Industrial', status:'Cobrado', badge:'badge-ok', statusText:'Cobrado' },
    { ini:'SR', color:'#2563EB', name:'Sr. Rodríguez', type:'Residencial', status:'Consulta', badge:'badge-gray', statusText:'Visita pendiente' },
  ]

  return (
    <div>
      <div className="bg-navy px-5 pt-2 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="font-display text-[20px] font-extrabold text-white tracking-tight">New<span className="text-teal2">Fix</span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white">EP</div>
        </div>
        <div className="font-display text-[18px] font-bold text-white">Mis clientes</div>
        <div className="text-white/40 text-xs mt-0.5">5 activos</div>
      </div>

      <div className="p-4">
        <div className="space-y-2 mb-4">
          {MOCK.map((c) => (
            <div key={c.name} className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: c.color }}>{c.ini}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.type}</div>
                </div>
              </div>
              <span className={`badge ${c.badge} text-[10px]`}>{c.statusText}</span>
            </div>
          ))}
        </div>

        <button className="w-full border border-dashed border-slate-300 text-slate-400 text-sm py-3 rounded-xl">
          + Agregar cliente
        </button>
      </div>
    </div>
  )
}
