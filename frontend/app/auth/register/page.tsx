'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Zap, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  workspace_name: z.string().min(2, 'Nom entreprise requis'),
  name:           z.string().min(2, 'Votre nom requis'),
  email:          z.string().email('Email invalide'),
  phone:          z.string().optional(),
  industry:       z.string().optional(),
  password:       z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, { message: 'Les mots de passe ne correspondent pas', path: ['password_confirmation'] })
type Form = z.infer<typeof schema>

const industries = ['Mode & Textile','Restaurant & Hôtellerie','Santé & Beauté','Education','ONG & Associations','Commerce & Retail','Immobilier','Tech & Services','Autre']

export default function RegisterPage() {
  const { register: auth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setLoading(true); setError('')
    try { await auth(data as any) }
    catch (e: any) { setError(e.response?.data?.message || 'Erreur lors de la création du compte') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4"><Zap size={32} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-white">AFRIHUB</h1>
          <p className="text-gray-400 mt-1">Essai gratuit 14 jours — Aucune carte requise</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Créer votre espace</h2>
          <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
            {['14 jours gratuits','Annulez à tout moment','Support WhatsApp inclus'].map(t => (
              <span key={t} className="flex items-center gap-1"><Check size={12} className="text-green-500" />{t}</span>
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                <input {...register('workspace_name')} className="input" placeholder="Mon Entreprise" />
                {errors.workspace_name && <p className="text-red-500 text-xs mt-1">{errors.workspace_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
                <input {...register('name')} className="input" placeholder="Prénom Nom" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email')} type="email" className="input" placeholder="vous@exemple.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input {...register('phone')} className="input" placeholder="+226 70 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                <select {...register('industry')} className="input">
                  <option value="">Choisir...</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input {...register('password')} type="password" className="input" placeholder="Min. 8 caractères" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer *</label>
                <input {...register('password_confirmation')} type="password" className="input" placeholder="••••••••" />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Création...' : 'Démarrer l\'essai gratuit →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ? <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
