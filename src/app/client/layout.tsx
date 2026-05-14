'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Wrench, Calendar, Users, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/client/inicio',    label: 'Inicio',    Icon: Home },
  { href: '/client/trabajos',  label: 'Trabajos',  Icon: Wrench },
  { href: '/client/agenda',    label: 'Agenda',    Icon: Calendar },
  { href: '/client/clientes',  label: 'Clientes',  Icon: Users },
  { href: '/client/cobros',    label: 'Cobros',    Icon: DollarSign },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start py-0 md:py-6 md:px-4">
      <div className="w-full max-w-sm md:rounded-[40px] overflow-hidden flex flex-col md:shadow-2xl"
        style={{ minHeight: '100vh', background: '#F8FAFC' }}>

        {/* Status bar */}
        <div className="bg-navy flex items-end justify-between px-5 pt-3 pb-2 h-12 flex-shrink-0">
          <span className="text-sm font-semibold text-white">9:41</span>
          <div className="flex gap-1 items-center opacity-80">
            <svg width="14" height="11" fill="white" viewBox="0 0 14 11">
              <rect x="0" y="3" width="3" height="8" opacity=".4" rx="1"/>
              <rect x="4" y="2" width="3" height="9" opacity=".6" rx="1"/>
              <rect x="8" y="0" width="3" height="11" opacity=".8" rx="1"/>
              <rect x="12" y="0" width="2" height="11" rx="1"/>
            </svg>
            <span className="text-white text-[11px]">100%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {children}
        </div>

        {/* Bottom Nav */}
        <nav className="bg-white border-t border-slate-200 flex py-2 pb-5 flex-shrink-0 sticky bottom-0 z-50">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className="flex-1 flex flex-col items-center gap-1 py-1 cursor-pointer relative">
                {active && (
                  <span className="absolute top-0 w-1 h-1 rounded-full bg-teal" />
                )}
                <Icon size={20} className={active ? 'text-teal' : 'text-slate-300'} />
                <span className={cn('text-[10px] font-medium', active ? 'text-teal' : 'text-slate-400')}>
                  {label}
                </span>
                {label === 'Cobros' && (
                  <span className="absolute -top-0.5 right-[calc(50%-20px)] bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                    2
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
