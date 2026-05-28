'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Radio, Target, Users, BarChart2, Settings, LogOut, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/posts',       icon: FileText,        label: 'Publications' },
  { href: '/broadcasts',  icon: Radio,           label: 'WhatsApp Broadcast' },
  { href: '/campaigns',   icon: Target,          label: 'Campagnes Pub' },
  { href: '/contacts',    icon: Users,           label: 'Contacts' },
  { href: '/analytics',   icon: BarChart2,       label: 'Analytics' },
  { href: '/settings/accounts', icon: Settings,  label: 'Paramètres' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, workspace, logout } = useAuth()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">AFRIHUB</span>
        </div>
        {workspace && (
          <div className="mt-3 px-2 py-1.5 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">Espace de travail</p>
            <p className="text-sm font-medium text-white truncate">{workspace.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded-full font-medium uppercase">{workspace.plan}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-brand-500 text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}
