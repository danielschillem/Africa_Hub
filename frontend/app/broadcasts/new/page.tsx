'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useCreateBroadcast, useBroadcastTemplates, useBroadcastSegments } from '@/hooks/useBroadcasts'
import { ArrowLeft, Send, Users } from 'lucide-react'
import Link from 'next/link'

export default function NewBroadcastPage() {
  const router    = useRouter()
  const create    = useCreateBroadcast()
  const { data: templates } = useBroadcastTemplates()
  const { data: segments }  = useBroadcastSegments()
  const [form, setForm]     = useState({ name: '', template_id: '', template_name: '', segment: 'all', template_vars: {} as any, scheduled_at: '' })
  const [mode, setMode]     = useState<'now'|'schedule'>('now')

  const selectedTemplate = (templates || []).find((t: any) => t.id === form.template_id)
  const selectedSegment  = (segments  || []).find((s: any) => s.id === form.segment)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { ...form }
    if (mode === 'now') delete payload.scheduled_at
    try { await create.mutateAsync(payload); router.push('/broadcasts') } catch {}
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/broadcasts" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau broadcast</h1>
            <p className="text-gray-500 text-sm">Envoyez un message groupé WhatsApp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du broadcast *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="input" placeholder="Ex: Rappel live mode femme" required />
          </div>

          {/* Segment */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Destinataires *</label>
            <div className="space-y-2">
              {(segments || []).map((s: any) => (
                <label key={s.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${form.segment===s.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="segment" value={s.id} checked={form.segment===s.id}
                      onChange={() => setForm({...form, segment: s.id})} className="text-brand-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.label}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users size={14} className="text-gray-400" />{s.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Template de message *</label>
            <select value={form.template_id} onChange={e => {
              const t = (templates||[]).find((x: any) => x.id === e.target.value)
              setForm({...form, template_id: e.target.value, template_name: t?.name || '', template_vars: {}})
            }} className="input mb-4" required>
              <option value="">Choisir un template...</option>
              {(templates||[]).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTemplate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-medium mb-2">APERÇU</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTemplate.preview}</p>
                {selectedTemplate.vars.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Variables à remplir :</p>
                    {selectedTemplate.vars.map((v: string) => (
                      <div key={v}>
                        <label className="text-xs text-gray-500 mb-1 block">{v}</label>
                        <input className="input text-sm" placeholder={`Valeur de ${v}`}
                          onChange={e => setForm(f => ({ ...f, template_vars: { ...f.template_vars, [v]: e.target.value } }))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Envoi */}
          <div className="card p-6">
            <div className="flex gap-3 mb-4">
              {[{v:'now',label:'Envoyer maintenant'},{v:'schedule',label:'Programmer'}].map(({v,label}) => (
                <button key={v} type="button" onClick={() => setMode(v as any)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${mode===v ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{label}</button>
              ))}
            </div>
            {mode === 'schedule' && (
              <input type="datetime-local" value={form.scheduled_at}
                onChange={e => setForm({...form, scheduled_at: e.target.value})}
                className="input" min={new Date().toISOString().slice(0,16)} />
            )}
          </div>

          {selectedSegment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              Ce broadcast sera envoyé à <strong>{selectedSegment.count} contacts</strong>.
            </div>
          )}

          <div className="flex gap-4">
            <Link href="/broadcasts" className="btn-secondary flex-1 text-center">Annuler</Link>
            <button type="submit" disabled={create.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send size={16} />{create.isPending ? 'Création...' : 'Créer le broadcast'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
