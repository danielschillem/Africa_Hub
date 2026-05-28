'use client'
import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import PlatformBadge from '@/components/ui/PlatformBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useDashboardAnalytics, usePostsAnalytics, useConversionAnalytics } from '@/hooks/useAnalytics'
import { formatFCFA, formatNumber, getPlatformColor, getPlatformLabel } from '@/lib/utils'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts'
import { TrendingUp, Eye, MousePointer, ShoppingCart, DollarSign, Percent } from 'lucide-react'

export default function AnalyticsPage() {
  const [period, setPeriod]   = useState('30')
  const from = new Date(Date.now() - parseInt(period) * 86400000).toISOString()
  const { data: dash, isLoading } = useDashboardAnalytics(from)
  const { data: posts }           = usePostsAnalytics(from)
  const { data: conv }            = useConversionAnalytics(from)

  if (isLoading) return <MainLayout><div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div></MainLayout>

  const d = dash || {}
  const kpis = [
    { label: 'Portée totale',      value: formatNumber(d.total_reach || 0),       icon: Eye,           color: 'blue'   },
    { label: 'Impressions',        value: formatNumber(d.total_impressions || 0),  icon: Eye,           color: 'purple' },
    { label: 'Clics',             value: formatNumber(d.total_clicks || 0),       icon: MousePointer,  color: 'indigo' },
    { label: 'Conversions',       value: d.total_conversions || 0,               icon: ShoppingCart,  color: 'green'  },
    { label: 'Revenus trackés',   value: formatFCFA(d.total_revenue || 0),        icon: DollarSign,    color: 'emerald'},
    { label: 'ROI Pub',           value: `${d.roi || 0}%`,                        icon: Percent,       color: 'brand'  },
  ]

  const byPlatform = (d.by_platform || []).map((p: any) => ({ name: getPlatformLabel(p.platform), reach: p.reach, clicks: p.clicks, color: getPlatformColor(p.platform) }))
  const dailyData  = (d.daily_revenue || []).map((x: any) => ({ date: x.date?.slice(5), revenue: Number(x.revenue) }))

  return (
    <MainLayout>
      <PageHeader title="Analytics & Conversion" desc="Performances de votre contenu et ROI par publication"
        action={
          <div className="flex gap-2">
            {['7','30','90'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period===p ? 'bg-brand-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {p}j
              </button>
            ))}
          </div>
        } />

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon size={16} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Évolution des revenus trackés</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={(v: any) => [formatFCFA(v), 'Revenus']} />
              <Line type="monotone" dataKey="revenue" stroke="#1A6B3C" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Portée par plateforme</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPlatform}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={(v: any) => [formatNumber(v), 'Portée']} />
              {byPlatform.map((p: any) => <Bar key={p.name} dataKey="reach" fill={p.color} radius={[4,4,0,0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel conversion */}
      {conv && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card p-6 col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Entonnoir de conversion</h3>
            <div className="space-y-3">
              {[
                { label: 'Clics', value: conv.funnel?.clicks || 0, color: 'bg-blue-500' },
                { label: 'Pages vues', value: conv.funnel?.page_views || 0, color: 'bg-indigo-500' },
                { label: 'Prospects', value: conv.funnel?.leads || 0, color: 'bg-purple-500' },
                { label: 'Achats', value: conv.funnel?.purchases || 0, color: 'bg-green-500' },
              ].map(({ label, value, color }, i, arr) => {
                const pct = arr[0].value > 0 ? Math.round(value/arr[0].value*100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900">{value.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6 col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Revenus par source</h3>
            <div className="space-y-3">
              {(conv.by_source || []).map((s: any) => (
                <div key={s.source} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: getPlatformColor(s.source) }} />
                  <span className="text-sm text-gray-600 w-24">{getPlatformLabel(s.source)}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: getPlatformColor(s.source), width: `${conv.by_source.length > 0 ? s.revenue/(Math.max(...conv.by_source.map((x:any)=>x.revenue)))*100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-32 text-right">{formatFCFA(s.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top posts tableau */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Classement des publications — par GMV</h3>
        {(posts || []).length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Publiez du contenu pour voir les performances ici</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {['#','Titre','Plateformes','Portée','Clics','GMV','Conversions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(posts || []).map((p: any, i: number) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm font-medium text-gray-500">#{i+1}</td>
                  <td className="py-3 px-2 text-sm font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                  <td className="py-3 px-2"><div className="flex gap-1">{(p.platforms||[]).map((pl: string) => <PlatformBadge key={pl} platform={pl} />)}</div></td>
                  <td className="py-3 px-2 text-sm text-gray-700">{formatNumber(p.reach)}</td>
                  <td className="py-3 px-2 text-sm text-gray-700">{formatNumber(p.clicks)}</td>
                  <td className="py-3 px-2 text-sm font-bold text-green-600">{formatFCFA(p.gmv)}</td>
                  <td className="py-3 px-2 text-sm text-gray-700">{p.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  )
}
