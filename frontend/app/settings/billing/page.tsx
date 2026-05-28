'use client'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import { useAppStore } from '@/lib/store'
import { Check } from 'lucide-react'

const plans = [
  { id:'solo',   name:'SOLO',   price:10000,  annual:100000,  features:['2 comptes sociaux','1 utilisateur','15 posts/mois','5 broadcasts/mois','Analytics basiques','Support WhatsApp'] },
  { id:'pme',    name:'PME',    price:25000,  annual:250000,  features:['4 comptes sociaux','3 utilisateurs','Posts illimités','20 broadcasts/mois','1 campagne publicitaire','Analytics complets','Support WhatsApp prioritaire'], popular:true },
  { id:'pro',    name:'PRO',    price:60000,  annual:600000,  features:['8 comptes sociaux','5 utilisateurs','Posts illimités','Broadcasts illimités','3 campagnes actives','Analytics avancés + Export','Support dédié'] },
  { id:'agence', name:'AGENCE', price:150000, annual:1500000, features:['Comptes illimités','Utilisateurs illimités','Tout illimité','Campagnes illimitées','Marque blanche','API complète','Account Manager dédié'] },
]

export default function BillingPage() {
  const { workspace } = useAppStore()

  return (
    <MainLayout>
      <PageHeader title="Abonnement" desc="Choisissez le plan adapté à vos besoins" />
      <div className="grid grid-cols-4 gap-6">
        {plans.map(p => (
          <div key={p.id} className={`card p-6 relative ${p.popular ? 'border-brand-500 border-2' : ''} ${workspace?.plan === p.id ? 'ring-2 ring-brand-500' : ''}`}>
            {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs px-3 py-1 rounded-full font-medium">Populaire</div>}
            {workspace?.plan === p.id && <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">Plan actuel</div>}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{p.price.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">FCFA/mois</span>
              </div>
              <p className="text-xs text-green-600 mt-1">ou {p.annual.toLocaleString()} FCFA/an (2 mois offerts)</p>
            </div>
            <div className="space-y-2.5 mb-6">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check size={14} className="text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>
            <button disabled={workspace?.plan === p.id}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${workspace?.plan === p.id ? 'bg-gray-100 text-gray-400 cursor-default' : 'btn-primary'}`}>
              {workspace?.plan === p.id ? 'Plan actuel' : 'Choisir ce plan'}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 card p-6 bg-brand-50 border-brand-100">
        <h3 className="font-semibold text-brand-900 mb-2">Paiement sécurisé via Mobile Money</h3>
        <p className="text-sm text-brand-700">Orange Money et Moov Money acceptés. Paiement mensuel ou annuel. Annulation à tout moment sans frais. Support WhatsApp disponible 7j/7.</p>
      </div>
    </MainLayout>
  )
}
