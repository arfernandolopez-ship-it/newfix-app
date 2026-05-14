'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, GitBranch, Calendar, CheckSquare,
  Shield, FileText, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [userName, setUserName] = useState('Operador')
  const [userInitials, setUserInitials] = useState('OP')
  const [tareasBadge, setTareasBadge] = useState(0)
  const [syhBadge, setSyhBadge] = useState(0)

  useEffect(() => {
    // Fetch user name
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || ''
      const name = email.split('@')[0].replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
      setUserName(name || 'Operador')
      setUserInitials(name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'OP')
    })

    // Fetch tareas pendientes count
    supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('completada', false)
      .then(({ count }) => setTareasBadge(count || 0))

    // Fetch clientes con SyH no ok
    supabase.from('clientes').select('id', { count: 'exact', head: true })
      .eq('activo', true).neq('estado_syh', 'ok')
      .then(({ count }) => setSyhBadge(count || 0))
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const NAV = [
    { section: 'Principal', items: [
      { href: '/operator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/operator/clientes',  label: 'Clientes',  icon: Users },
    ]},
    { section: 'Planificación', items: [
      { href: '/operator/pipeline', label: 'Pipeline', icon: GitBranch },
      { href: '/operator/agenda',   label: 'Agenda',   icon: Calendar },
      { href: '/operator/tareas',   label: 'Tareas',   icon: CheckSquare, badge: tareasBadge, badgeColor: 'red' },
    ]},
    { section: 'Compliance', items: [
      { href: '/operator/compliance', label: 'SyH & ISO', icon: Shield, badge: syhBadge, badgeColor: 'amber' },
    ]},
    { section: 'Finanzas', items: [
      { href: '/operator/facturas', label: 'Facturas', icon: FileText },
    ]},
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 bg-navy flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="font-display text-xl font-extrabold text-white tracking-tight">
            New<span className="text-teal2">Fix</span>
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Panel Operador</div>
        </div>

        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
          {NAV.map(section => (
            <div key={section.section}>
              <div className="text-[9px] font-semibold text-white/25 uppercase tracking-widest px-2 mb-1.5">
                {section.section}
              </div>
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('nav-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 mb-0.5 border text-slate-400',
                      active ? 'bg-teal/10 border-teal/25 !text-teal2' : 'border-transparent hover:bg-white/5'
                    )}>
                    <item.icon size={15} />
                    <span className="text-[13px] font-medium flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <span className={cn(
                        'text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center text-white',
                        item.badgeColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="px-2.5 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/65 font-medium truncate">{userName}</div>
              <div className="text-[10px] text-white/30">Operador NewFix</div>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut size={14} className="text-white/40 hover:text-white/80" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
