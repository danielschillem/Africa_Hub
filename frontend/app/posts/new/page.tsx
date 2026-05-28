'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useCreatePost } from '@/hooks/usePosts'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import { getPlatformColor, getPlatformLabel } from '@/lib/utils'
import { ArrowLeft, Facebook, Image, Clock, Send } from 'lucide-react'
import Link from 'next/link'

const platforms = ['facebook','instagram','tiktok','whatsapp']
const platformIcons: Record<string, string> = { facebook: 'f', instagram: '◈', tiktok: '♪', whatsapp: '✆' }

export default function NewPostPage() {
  const router     = useRouter()
  const createPost = useCreatePost()
  const { data: accounts } = useSocialAccounts()

  const [form, setForm] = useState({ title: '', content: '', platforms: [] as string[], scheduled_at: '', campaign_tag: '' })
  const [publishMode, setMode] = useState<'now'|'schedule'>('now')

  const connectedPlatforms = (accounts || []).filter((a: any) => a.is_active).map((a: any) => a.platform)

  const togglePlatform = (p: string) => {
    setForm(f => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter(x=>x!==p) : [...f.platforms,p] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content || form.platforms.length === 0) return
    const payload: any = { ...form }
    if (publishMode === 'now' || !form.scheduled_at) delete payload.scheduled_at
    try {
      await createPost.mutateAsync(payload)
      router.push('/posts')
    } catch {}
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/posts" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau post</h1>
            <p className="text-gray-500 text-sm">Créez et planifiez votre publication</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre (interne) *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="input" placeholder="Ex: Promo weekend mode femme" required />
          </div>

          {/* Contenu */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu du post *</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              className="input min-h-32 resize-none" rows={5}
              placeholder="Votre message... Le lien de tracking AFRIHUB sera ajouté automatiquement" required />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Le lien de suivi sera ajouté automatiquement ✓</span>
              <span>{form.content.length} caractères</span>
            </div>
          </div>

          {/* Plateformes */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Plateformes de publication *</label>
            <div className="grid grid-cols-4 gap-3">
              {platforms.map(p => {
                const connected = connectedPlatforms.includes(p)
                const selected  = form.platforms.includes(p)
                return (
                  <button key={p} type="button" disabled={!connected}
                    onClick={() => connected && togglePlatform(p)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${selected ? 'border-brand-500 bg-brand-50' : connected ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 opacity-40 cursor-not-allowed'}`}>
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: getPlatformColor(p) }}>{platformIcons[p]}</div>
                    <p className="text-xs font-medium text-gray-700">{getPlatformLabel(p)}</p>
                    {!connected && <p className="text-xs text-gray-400 mt-0.5">Non connecté</p>}
                    {selected && <div className="w-2 h-2 bg-brand-500 rounded-full mx-auto mt-1" />}
                  </button>
                )
              })}
            </div>
            {connectedPlatforms.length === 0 && (
              <p className="text-sm text-orange-600 mt-3 bg-orange-50 p-3 rounded-lg">
                Aucun compte connecté. <Link href="/settings/accounts" className="underline font-medium">Connecter vos réseaux →</Link>
              </p>
            )}
          </div>

          {/* Programmation */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Publication</label>
            <div className="flex gap-3 mb-4">
              {[{v:'now',label:'Maintenant',icon:Send},{v:'schedule',label:'Programmer',icon:Clock}].map(({v,label,icon:Icon}) => (
                <button key={v} type="button" onClick={() => setMode(v as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${publishMode===v ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
            {publishMode === 'schedule' && (
              <input type="datetime-local" value={form.scheduled_at}
                onChange={e => setForm({...form, scheduled_at: e.target.value})}
                className="input" min={new Date().toISOString().slice(0,16)} />
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <Link href="/posts" className="btn-secondary flex-1 text-center">Annuler</Link>
            <button type="submit" disabled={createPost.isPending || !form.title || !form.content || form.platforms.length === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send size={16} />
              {createPost.isPending ? 'Création...' : publishMode === 'now' ? 'Publier maintenant' : 'Programmer'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
