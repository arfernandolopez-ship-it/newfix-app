'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmtDate } from '@/lib/utils'

export default function TareasPage() {
  const supabase = createClient()
  const [tareas, setTareas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTareas()
  }, [])

  async function loadTareas() {
    const { data } = await supabase
      .from('tareas')
      .select('*, cliente:clientes(nombre)')
      .order('completada')
      .order('prioridad')
      .order('fecha_limite')
    setTareas(data || [])
    setLoading(false)
  }

  async function toggleTarea(id: string, completada: boolean) {
    await supabase.from('tareas').update({ completada: !completada }).eq('id', id)
    setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t))
  }

  const pendientes = tareas.filter(t => !t.completada)
  const urgentes = pendientes.filter(t => t.prioridad === 'alta')
  const normales = pendientes.filter(t => t.prioridad !== 'alta')
  const completadas = tareas.filter(t => t.completada)

  const CAT_COLORS: Record<string, string> = {
    syh: 'badge-risk', factura: 'badge-gray', cobro: 'badge-warn',
    trabajo: 'badge-purple', admin: 'badge-gray',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-display text-lg font-bold text-slate-900">Tareas</div>
          <div className="text-xs text-slate-400">{pendientes.length} pendientes · {urgentes.length} urgentes</div>
        </div>
        <button className="btn btn-teal btn-sm">+ Nueva tarea</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-5">
          <div>
            {urgentes.length > 0 && (
              <>
                <div className="font-display text-sm font-bold text-red-600 mb-3">⚡ Urgentes</div>
                <div className="card mb-5">
                  <div className="divide-y divide-slate-100">
                    {urgentes.map(t => (
                      <TareaRow key={t.id} tarea={t} onToggle={toggleTarea} catColors={CAT_COLORS} />
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="font-display text-sm font-bold text-slate-900 mb-3">Pendientes</div>
            <div className="card">
              <div className="divide-y divide-slate-100">
                {normales.map(t => (
                  <TareaRow key={t.id} tarea={t} onToggle={toggleTarea} catColors={CAT_COLORS} />
                ))}
                {normales.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin tareas pendientes</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-slate-400 mb-3">Completadas ({completadas.length})</div>
            <div className="card opacity-60">
              <div className="divide-y divide-slate-100">
                {completadas.slice(0, 8).map(t => (
                  <TareaRow key={t.id} tarea={t} onToggle={toggleTarea} catColors={CAT_COLORS} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TareaRow({ tarea, onToggle, catColors }: any) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <button
        onClick={() => onToggle(tarea.id, tarea.completada)}
        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all
          ${tarea.completada ? 'bg-green-600 border-green-600' : 'border-slate-300 hover:border-teal'}`}
      >
        {tarea.completada && <span className="text-white text-[10px]">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {tarea.texto}
        </div>
        <div className="flex gap-2 mt-1 flex-wrap">
          {tarea.prioridad === 'alta' && !tarea.completada && (
            <span className="text-[10px] font-bold text-red-600">Urgente</span>
          )}
          {tarea.cliente?.nombre && (
            <span className="text-[10px] text-teal font-medium">{tarea.cliente.nombre}</span>
          )}
          {tarea.categoria && (
            <span className={`badge ${catColors[tarea.categoria] || 'badge-gray'} text-[10px]`}>
              {tarea.categoria}
            </span>
          )}
        </div>
      </div>
      {tarea.fecha_limite && (
        <span className={`text-[10px] flex-shrink-0 font-medium ${
          !tarea.completada && new Date(tarea.fecha_limite) <= new Date() ? 'text-red-600' : 'text-slate-400'
        }`}>
          {fmtDate(tarea.fecha_limite)}
        </span>
      )}
    </div>
  )
}
