'use client'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCampaigns, useLaunchCampaign } from '@/hooks/useCampaigns'
import { formatFCFA, formatNumber, formatDate } from '@/lib/utils'
import { Plus, Play, Pause, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function CampaignsPage() {
  const { data, isLoading } = useCampaigns()
  const launchMutation       = useLaunchCampaign()
  const campaigns            = data?.data || []

  return (
    <MainLayout>
      <PageHeader title="Campagnes publicitaires" desc="Créez et pilotez vos campagnes Facebook, Instagram et TikTok"
        action={<Link href="/campaigns/new" className="btn-primary flex items-center gap-2"><Plus size={16} />Nouvelle campagne</Link>} />

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : campaigns.length === 0 ? (
        <EmptyState icon={Target} title="Aucune campagne" desc="Créez votre première campagne publicitaire pour booster vos publications."
          action={{ label: 'Créer une campagne', onClick: () => window.location.href = '/campaigns/new' }} />
      ) : (
        <div className="space-y-4">
          {campaigns.map((c: any) => (
            <div key={c.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-gray-500">{c.platform} · {c.objective} · {c.target_preset || 'Ciblage personnalisé'}</p>
                </div>
                {c.status === 'draft' && (
                  <button onClick={() => launchMutation.mutate(c.id)} disabled={launchMutation.isPending}
                    className="btn-primary flex items-center gap-2 ml-4">
                    <Play size={14} />{launchMutation.isPending ? 'Lancement...' : 'Lancer'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Budget total', value: formatFCFA(c.budget_total) },
                  { label: 'Dépensé', value: formatFCFA(c.spend_to_date) },
                  { label: 'Portée', value: formatNumber(c.reach) },
                  { label: 'Clics', value: formatNumber(c.clicks) },
                  { label: 'ROI', value: c.roi ? `${c.roi}%` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>Du {formatDate(c.start_date)} {c.end_date ? `au ${formatDate(c.end_date)}` : ''}</span>
                {c.last_sync_at && <span>Mis à jour : {formatDate(c.last_sync_at)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}
