'use client'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useBroadcasts, useSendBroadcast } from '@/hooks/useBroadcasts'
import { formatDate } from '@/lib/utils'
import { Plus, Send, Radio, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function BroadcastsPage() {
  const { data, isLoading } = useBroadcasts()
  const sendMutation        = useSendBroadcast()
  const broadcasts = data?.data || []

  return (
    <MainLayout>
      <PageHeader title="WhatsApp Broadcast" desc="Envoyez des messages groupés à vos contacts"
        action={<Link href="/broadcasts/new" className="btn-primary flex items-center gap-2"><Plus size={16} />Nouveau broadcast</Link>} />

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : broadcasts.length === 0 ? (
        <EmptyState icon={Radio} title="Aucun broadcast" desc="Créez votre premier message groupé WhatsApp."
          action={{ label: 'Créer un broadcast', onClick: () => window.location.href = '/broadcasts/new' }} />
      ) : (
        <div className="space-y-4">
          {broadcasts.map((b: any) => (
            <div key={b.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{b.name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Template : {b.template_name} · Segment : {b.segment}</p>
                  <div className="flex gap-6 text-sm">
                    {[
                      { icon: Users,      val: b.total_recipients, label: 'destinataires' },
                      { icon: Send,       val: b.sent_count,       label: 'envoyés' },
                      { icon: CheckCircle,val: b.delivered_count,  label: 'livrés' },
                    ].map(({ icon: Icon, val, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-gray-600">
                        <Icon size={14} className="text-gray-400" />
                        <span className="font-medium">{val}</span>
                        <span className="text-gray-400">{label}</span>
                      </div>
                    ))}
                    {b.delivered_count > 0 && (
                      <span className="text-green-600 font-medium">{Math.round(b.read_count/b.delivered_count*100)}% lus</span>
                    )}
                  </div>
                  {b.scheduled_at && <p className="text-xs text-gray-400 mt-2">Programmé : {formatDate(b.scheduled_at)}</p>}
                  {b.sent_at && <p className="text-xs text-gray-400 mt-2">Envoyé le {formatDate(b.sent_at)}</p>}
                </div>
                {b.status === 'draft' && (
                  <button onClick={() => sendMutation.mutate(b.id)} disabled={sendMutation.isPending}
                    className="btn-primary flex items-center gap-2 ml-4">
                    <Send size={14} />{sendMutation.isPending ? 'Envoi...' : 'Envoyer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}
