// ─── DATABASE TYPES ────────────────────────────────────────────────────────────

export type Plan = 'basico' | 'pro' | 'premium'
export type SyhEstado = 'ok' | 'warn' | 'risk'
export type TrabajoEtapa = 'llamado' | 'visita' | 'presupuesto' | 'trabajo' | 'factura' | 'cobro'
export type TrabajoEstado = 'activo' | 'completado' | 'cancelado'
export type FacturaEstado = 'borrador' | 'pendiente' | 'cobrada' | 'atrasada'
export type TareaCategoria = 'syh' | 'factura' | 'cobro' | 'trabajo' | 'admin'
export type TareaPrioridad = 'alta' | 'media' | 'baja'
export type ComplianceTipo = 'syh' | 'art' | 'habilitacion' | 'iso' | 'afip'
export type ComplianceEstado = 'vigente' | 'por_vencer' | 'vencido' | 'renovado'
export type UserRole = 'operator' | 'client'

export interface Cliente {
  id: string
  created_at: string
  nombre: string
  rubro: string
  plan: Plan
  telefono: string | null
  email: string | null
  cuit: string | null
  facturacion_estimada: number
  estado_syh: SyhEstado
  vence_syh: string | null
  art: string
  habilitacion: string
  iso_estado: string
  notas: string | null
  activo: boolean
  user_id: string | null
}

export interface Trabajo {
  id: string
  created_at: string
  cliente_id: string
  titulo: string
  cliente_final: string | null
  descripcion: string | null
  etapa: TrabajoEtapa
  estado: TrabajoEstado
  monto: number | null
  fecha_visita: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  cliente?: Cliente
}

export interface Factura {
  id: string
  created_at: string
  cliente_id: string
  numero: string
  monto: number
  fecha_emision: string
  fecha_vencimiento: string | null
  estado: FacturaEstado
  concepto: string | null
  metodo_pago: string
  cliente?: Cliente
}

export interface Tarea {
  id: string
  created_at: string
  cliente_id: string | null
  texto: string
  categoria: TareaCategoria
  prioridad: TareaPrioridad
  fecha_limite: string | null
  completada: boolean
  notas: string | null
  cliente?: Cliente
}

export interface Compliance {
  id: string
  created_at: string
  cliente_id: string
  tipo: ComplianceTipo
  descripcion: string | null
  fecha_vencimiento: string | null
  estado: ComplianceEstado
  notas: string | null
  cliente?: Cliente
}

export interface ClientUser {
  id: string
  cliente_id: string
  email: string
  role: UserRole
  created_at: string
}

// ─── UI TYPES ──────────────────────────────────────────────────────────────────

export interface KpiData {
  label: string
  value: string | number
  sub: string
  color: string
  onClick?: () => void
}

export interface TrabajoEtapaInfo {
  key: TrabajoEtapa
  label: string
  emoji: string
  color: string
}

export const ETAPAS: TrabajoEtapaInfo[] = [
  { key: 'llamado',      label: 'Llamado',      emoji: '📞', color: '#94A3B8' },
  { key: 'visita',       label: 'Visita',       emoji: '🔍', color: '#2563EB' },
  { key: 'presupuesto',  label: 'Presupuesto',  emoji: '📋', color: '#7C3AED' },
  { key: 'trabajo',      label: 'Trabajo',      emoji: '🔧', color: '#D97706' },
  { key: 'factura',      label: 'Factura',      emoji: '🧾', color: '#0BA89A' },
  { key: 'cobro',        label: 'Cobro',        emoji: '💰', color: '#059669' },
]

export const PLAN_LABELS: Record<Plan, string> = {
  basico: 'Básico',
  pro: 'Pro',
  premium: 'Premium',
}

export const PLAN_PRICES: Record<Plan, number> = {
  basico: 80000,
  pro: 150000,
  premium: 300000,
}

export const SYH_LABELS: Record<SyhEstado, string> = {
  ok: 'Vigente',
  warn: 'Por vencer',
  risk: 'Vencido',
}
