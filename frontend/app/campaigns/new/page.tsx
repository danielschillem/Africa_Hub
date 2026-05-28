'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useCreateCampaign, useCampaignPresets } from '@/hooks/useCampaigns'
import { formatFCFA, getPlatformColor, getPlatformLabel } from '@/lib/utils'
import { ArrowLeft, Target, Users, TrendingUp, Eye } from 'lucide-react'
import Link from 'next/link'

const objectives = [
  { id: 'reach',       label: 'Notoriété',    desc: 'Toucher un maximum de personnes', icon: Eye },
  { id: 'traffic',     label: 'Trafic',        desc: 'Diriger vers votre app/site',     icon: TrendingUp },
  { id: 'lead_gen',    label: 'Prospects',     desc: 'Collecter des contacts qualifiés', icon: Users },
  { id: 'conversions', label: 'Conversions',   desc: 'Générer des achats ou inscriptions', icon: Target },
]

export default function NewCampaignPage() {
  const router  = useRouter()
  const create  = useCreateCampaign()
  const { data: presets } = useCampaignPresets()
  const [form, setForm] = useState({ name:'', platform:'facebook', objective:'traffic', target_preset:'', budget_total: 50000, start_date: new Date().toISOString().slice(0,10), end_date:'' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await create.mutateAsync(form); router.push('/campaigns') } catch {}
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/campaigns" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle campagne</h1>
            <p className="text-gray-500 text-sm">Créez une campagne publicitaire ciblée</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom + Plateforme */}
          <div className="card p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la campagne *</label>
                <input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="input" placeholder="Ex: Recrutement Commerciaux Mars" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plateforme *</label>
                <div className="flex gap-3">
                  {['facebook','instagram','tiktok'].map(p => (
                    <button key={p} type="button" onClick={() => setForm({...form,platform:p})}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${form.platform===p ? 'border-brand-500' : 'border-gray-200'}`}>
                      <div className="w-6 h-6 rounded mx-auto mb-1 text-white flex items-center justify-center text-xs font-bold"
                        style={{background:getPlatformColor(p)}}>{getPlatformLabel(p)[0]}</div>
                      <p className="text-xs font-medium text-center">{getPlatformLabel(p)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Objectif */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Objectif *</label>
            <div className="grid grid-cols-2 gap-3">
              {objectives.map(({ id, label, desc, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setForm({...form,objective:id})}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.objective===id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Icon size={20} className={form.objective===id ? 'text-brand-600' : 'text-gray-400'} />
                  <p className="text-sm font-semibold text-gray-900 mt-2">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ciblage preset */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Audience cible</label>
            <div className="space-y-2">
              {(presets||[]).filter((p: any) => p.platform === form.platform || !p.platform).map((p: any) => (
                <label key={p.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.target_preset===p.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="preset" value={p.id} checked={form.target_preset===p.id}
                    onChange={() => setForm({...form,target_preset:p.id})} className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">Min. {formatFCFA(p.budget_min)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget + Dates */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Budget et durée</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Budget total (FCFA) *</label>
                <input type="number" value={form.budget_total} onChange={e => setForm({...form,budget_total:Number(e.target.value)})}
                  className="input" min={5000} step={5000} required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date de début *</label>
                <input type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date de fin</label>
                <input type="date" value={form.end_date} onChange={e => setForm({...form,end_date:e.target.value})} className="input" />
              </div>
            </div>
            {form.budget_total > 0 && form.start_date && (
              <p className="text-sm text-gray-500 mt-3">
                Budget journalier estimé : {formatFCFA(Math.round(form.budget_total / 7))} (sur 7 jours par défaut)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Link href="/campaigns" className="btn-secondary flex-1 text-center">Annuler</Link>
            <button type="submit" disabled={create.isPending || !form.name} className="btn-primary flex-1">
              {create.isPending ? 'Création...' : 'Créer la campagne'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
