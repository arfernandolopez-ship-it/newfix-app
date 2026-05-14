import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number): string {
  return n.toLocaleString('es-AR')
}

export function fmtDate(date: string | null): string {
  if (!date) return '—'
  return format(parseISO(date), "d MMM yyyy", { locale: es })
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null
  return differenceInDays(parseISO(date), new Date())
}

// Calcula el estado SyH real desde la fecha de vencimiento (ignora el campo almacenado que puede estar desactualizado)
export function computeSyhEstado(vence_syh: string | null, stored: string = 'ok'): 'ok' | 'warn' | 'risk' {
  const days = daysUntil(vence_syh)
  if (days === null) return stored as 'ok' | 'warn' | 'risk'
  if (days < 0) return 'risk'
  if (days <= 30) return 'warn'
  return 'ok'
}

export function syhColor(estado: string): string {
  switch (estado) {
    case 'ok':   return 'text-green-600'
    case 'warn': return 'text-amber-600'
    case 'risk': return 'text-red-600'
    default:     return 'text-gray-500'
  }
}

export function etapaIndex(etapa: string): number {
  const order = ['llamado','visita','presupuesto','trabajo','factura','cobro']
  return order.indexOf(etapa)
}
