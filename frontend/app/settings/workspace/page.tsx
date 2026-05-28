'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'

export default function WorkspaceSettingsPage() {
  const qc = useQueryClient()
  const { data: ws } = useQuery({ queryKey: ['workspace'], queryFn: () => api.get('/workspace').then(r => r.data) })
  const [form, setForm] = useState<any>(null)
  if (ws && !form) setForm({ name: ws.name, industry: ws.industry, country: ws.country, timezone: ws.timezone })

  const mutation = useMutation({
    mutationFn: (d: any) => api.put('/workspace', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace'] }); toast.success('Paramètres sauvegardés !') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  if (!form) return <MainLayout><div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div></MainLayout>

  return (
    <MainLayout>
      <PageHeader title="Paramètres de l'espace" desc="Informations de votre entreprise" />
      <div className="max-w-2xl">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center"><Building2 size={24} className="text-brand-600" /></div>
            <div><p className="font-semibold text-gray-900">{ws?.name}</p><p className="text-sm text-gray-500 capitalize">Plan {ws?.plan}</p></div>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label><input className="input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label><input className="input" value={form.industry||''} onChange={e => setForm({...form,industry:e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <select className="input" value={form.country} onChange={e => setForm({...form,country:e.target.value})}>
                  {[['BF','Burkina Faso'],['SN','Sénégal'],['CI','Côte d\'Ivoire'],['ML','Mali'],['CM','Cameroun']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
              <select className="input" value={form.timezone} onChange={e => setForm({...form,timezone:e.target.value})}>
                <option value="Africa/Ouagadougou">Africa/Ouagadougou (UTC+0)</option>
                <option value="Africa/Abidjan">Africa/Abidjan (UTC+0)</option>
                <option value="Africa/Dakar">Africa/Dakar (UTC+0)</option>
              </select>
            </div>
          </div>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary mt-6">
            {mutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>

        {/* Plan info */}
        <div className="card p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Votre plan</h3>
          <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl border border-brand-100 mb-4">
            <div>
              <p className="font-bold text-brand-700 text-lg uppercase">Plan {ws?.plan}</p>
              <p className="text-sm text-brand-600">
                {ws?.plan === 'solo'   && 'Idéal pour démarrer — 2 comptes sociaux, 1 utilisateur'}
                {ws?.plan === 'pme'    && 'Pour les PME actives — 4 comptes, 3 utilisateurs, campagnes'}
                {ws?.plan === 'pro'    && 'Pour les entreprises — 8 comptes, 5 utilisateurs, tout inclus'}
                {ws?.plan === 'agence' && 'Pour les agences — Tout illimité'}
              </p>
            </div>
            {ws?.plan !== 'agence' && <button onClick={() => window.location.href='/settings/billing'} className="btn-primary text-sm">Passer au plan sup.</button>}
          </div>
          {ws?.plan_limits && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Comptes sociaux', ws.plan_limits.social_accounts === -1 ? 'Illimité' : ws.plan_limits.social_accounts],
                ['Utilisateurs', ws.plan_limits.users === -1 ? 'Illimité' : ws.plan_limits.users],
                ['Posts/mois', ws.plan_limits.posts_per_month === -1 ? 'Illimité' : ws.plan_limits.posts_per_month],
                ['Broadcasts/mois', ws.plan_limits.broadcasts_per_month === -1 ? 'Illimité' : ws.plan_limits.broadcasts_per_month],
              ].map(([label, val]) => (
                <div key={label as string} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
