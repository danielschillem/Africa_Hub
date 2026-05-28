'use client'
import MainLayout from '@/components/layout/MainLayout'
import { useDashboardAnalytics } from '@/hooks/useAnalytics'
import { useAppStore } from '@/lib/store'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatFCFA, formatNumber, getPlatformColor, getPlatformLabel, getStatusBadge, getStatusLabel, formatDate, truncate } from '@/lib/utils'
import { TrendingUp, Eye, MousePointer, ShoppingCart, Zap, Plus, Radio, Target } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { workspace, user } = useAppStore()
  const { data, isLoading } = useDashboardAnalytics()

  if (isLoading) return <MainLayout><div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div></MainLayout>

  const stats = data || {}
  const platformData = (stats.by_platform || []).map((p: any) => ({ name: getPlatformLabel(p.platform), reach: p.reach, clicks: p.clicks, fill: getPlatformColor(p.platform) }))
  const dailyData    = (stats.daily_revenue || []).map((d: any) => ({ date: d.date?.slice(5), revenue: Number(d.revenue), count: d.count }))

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Voici les performances de vos 30 derniers jours</p>
        </div>
        <div className="flex gap-3">
          <Link href="/posts/new" className="btn-primary flex items-center gap-2"><Plus size={16} />Nouveau post</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Portée totale"      value={formatNumber(stats.total_reach || 0)}       icon={<Eye size={20} />}          color="blue"  />
        <StatCard title="Clics totaux"        value={formatNumber(stats.total_clicks || 0)}      icon={<MousePointer size={20} />} color="purple"/>
        <StatCard title="Revenus trackés"    value={formatFCFA(stats.total_revenue || 0)}        icon={<TrendingUp size={20} />}   color="green" />
        <StatCard title="ROI Campagnes"      value={`${stats.roi || 0}%`}                        icon={<Zap size={20} />}          color="brand" positive={stats.roi > 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Revenus journaliers */}
        <div className="col-span-2 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenus trackés — 7 derniers jours</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip formatter={(v: any) => [formatFCFA(v), 'Revenus']} />
                <Line type="monotone" dataKey="revenue" stroke="#1A6B3C" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Pas encore de données</div>}
        </div>

        {/* Répartition plateformes */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Par plateforme</h3>
          {platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={platformData} dataKey="reach" cx="50%" cy="50%" outerRadius={65} label={false}>
                    {platformData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {platformData.map((p: any) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: p.fill }} />
                      <span className="text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatNumber(p.reach)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Connectez vos réseaux</div>}
        </div>
      </div>

      {/* Top posts + Actions rapides */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top posts */}
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top publications</h3>
            <Link href="/analytics" className="text-brand-600 text-sm hover:underline">Voir tout</Link>
          </div>
          {(stats.top_posts || []).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Publiez votre premier post pour voir les stats</div>
          ) : (
            <div className="space-y-3">
              {(stats.top_posts || []).map((post: any, i: number) => (
                <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <div className="flex gap-2 mt-1">
                      {(post.platforms || []).map((p: string) => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ background: getPlatformColor(p)+'20', color: getPlatformColor(p) }}>{getPlatformLabel(p)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatFCFA(post.gmv)}</p>
                    <p className="text-xs text-gray-400">{formatNumber(post.reach)} vus</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            {[
              { href: '/posts/new', icon: Plus, label: 'Créer un post', desc: 'Planifier une publication', color: 'brand' },
              { href: '/broadcasts/new', icon: Radio, label: 'Broadcast WhatsApp', desc: 'Envoyer un message groupé', color: 'green' },
              { href: '/campaigns/new', icon: Target, label: 'Lancer une campagne', desc: 'Publicité Facebook/TikTok', color: 'blue' },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
                <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
                  <Icon size={18} className={`text-${color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Plan info */}
          {workspace && (
            <div className="mt-4 p-3 bg-brand-50 rounded-lg border border-brand-100">
              <p className="text-xs font-medium text-brand-700 uppercase mb-1">Plan {workspace.plan}</p>
              <p className="text-xs text-brand-600">
                {workspace.plan === 'solo' ? 'Passez au plan PME pour débloquer les campagnes pub' : 'Toutes les fonctionnalités actives ✓'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
