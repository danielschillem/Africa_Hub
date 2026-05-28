'use client'
import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import PlatformBadge from '@/components/ui/PlatformBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { usePosts, usePublishPost, useDeletePost } from '@/hooks/usePosts'
import { formatDate, truncate } from '@/lib/utils'
import { Plus, Send, Trash2, Copy, BarChart2, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function PostsPage() {
  const [view, setView]         = useState<'list'|'calendar'>('list')
  const [statusFilter, setFilter] = useState('')
  const { data, isLoading }    = usePosts(statusFilter ? { status: statusFilter } : undefined)
  const publishMutation         = usePublishPost()
  const deleteMutation          = useDeletePost()

  const posts = data?.data || []

  return (
    <MainLayout>
      <PageHeader
        title="Publications"
        desc="Gérez et planifiez vos posts sur tous vos réseaux"
        action={
          <div className="flex gap-3">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {['list','calendar'].map(v => (
                <button key={v} onClick={() => setView(v as any)} className={`px-4 py-2 text-sm font-medium transition-colors ${view===v ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {v === 'list' ? 'Liste' : 'Calendrier'}
                </button>
              ))}
            </div>
            <Link href="/posts/new" className="btn-primary flex items-center gap-2">
              <Plus size={16} />Nouveau post
            </Link>
          </div>
        }
      />

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {['', 'draft', 'scheduled', 'published', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'Tous' : { draft: 'Brouillons', scheduled: 'Programmés', published: 'Publiés', failed: 'Échoués' }[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FileText} title="Aucune publication"
          desc="Créez votre premier post pour le planifier sur vos réseaux sociaux."
          action={{ label: 'Créer un post', onClick: () => window.location.href = '/posts/new' }} />
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div key={post.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{truncate(post.title, 60)}</h3>
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{truncate(post.content, 120)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {(post.platforms || []).map((p: string) => <PlatformBadge key={p} platform={p} />)}
                    </div>
                    {post.scheduled_at && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} />{formatDate(post.scheduled_at)}</span>}
                    {post.published_at  && <span className="text-xs text-gray-400">Publié le {formatDate(post.published_at)}</span>}
                  </div>
                </div>
                {/* Analytics si publié */}
                {post.status === 'published' && post.analytics && (
                  <div className="flex gap-4 text-center">
                    {[
                      { label: 'Portée', val: post.analytics.reduce((s: number, a: any) => s+a.reach, 0) },
                      { label: 'Clics',  val: post.analytics.reduce((s: number, a: any) => s+a.clicks, 0) },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-lg font-bold text-gray-900">{val.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Actions */}
                <div className="flex gap-2">
                  {post.status === 'published' && (
                    <Link href={`/analytics?post=${post.id}`} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Voir les stats">
                      <BarChart2 size={16} />
                    </Link>
                  )}
                  {['draft','scheduled'].includes(post.status) && (
                    <button onClick={() => publishMutation.mutate(post.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Publier maintenant">
                      <Send size={16} />
                    </button>
                  )}
                  <button onClick={() => { if (confirm('Supprimer ce post ?')) deleteMutation.mutate(post.id) }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}
