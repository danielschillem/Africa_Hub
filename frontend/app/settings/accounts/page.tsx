'use client'
import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useSocialAccounts, useConnectFacebook, useDisconnectAccount } from '@/hooks/useSocialAccounts'
import { getPlatformColor, getPlatformLabel, formatDate } from '@/lib/utils'
import { Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Link as LinkIcon } from 'lucide-react'

const platformDocs: Record<string, { steps: string[]; scope: string }> = {
  facebook:  { steps: ['Connectez-vous à Facebook','Allez dans Paramètres → Business Integrations','Trouvez l\'App AFRIHUB','Accordez les permissions demandées','Copiez le Page Access Token','Entrez le Token et le Page ID ci-dessous'], scope: 'pages_manage_posts, pages_read_engagement' },
  instagram: { steps: ['Connectez Instagram à votre Page Facebook','Allez dans Meta Business Suite','Obtenez le Token d\'accès Instagram','Entrez le Token et l\'Instagram ID'], scope: 'instagram_basic, instagram_content_publish' },
  tiktok:    { steps: ['Allez sur developers.tiktok.com','Créez une App et demandez Content Posting API','Obtenez le code d\'autorisation','Entrez le code ci-dessous'], scope: 'video.publish, user.info.basic' },
  whatsapp:  { steps: ['Ouvrez un compte Termii sur termii.com','Créez votre Sender ID "AFRIHUB"','Récupérez votre API Key dans le dashboard','Entrez votre numéro WhatsApp Business et la clé'], scope: 'WhatsApp Business API via Termii' },
}

export default function AccountsPage() {
  const { data: accounts, isLoading } = useSocialAccounts()
  const connectFb = useConnectFacebook()
  const disconnect = useDisconnectAccount()
  const [showForm, setShowForm]     = useState<string|null>(null)
  const [formData, setFormData]     = useState<Record<string,string>>({})

  const handleConnect = async (platform: string) => {
    try {
      if (platform === 'facebook') await connectFb.mutateAsync({ access_token: formData.token, page_id: formData.page_id })
      setShowForm(null); setFormData({})
    } catch {}
  }

  return (
    <MainLayout>
      <PageHeader title="Comptes sociaux" desc="Connectez vos réseaux sociaux pour commencer à publier" />

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="space-y-6">
          {/* Comptes connectés */}
          {(accounts || []).length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Comptes connectés</h3>
              <div className="space-y-3">
                {(accounts || []).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: getPlatformColor(a.platform) }}>
                      {getPlatformLabel(a.platform)[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{a.account_name || a.page_name}</p>
                      <p className="text-sm text-gray-500">{getPlatformLabel(a.platform)} · {a.followers?.toLocaleString()} abonnés</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.token_status === 'expired' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <AlertCircle size={12} />Token expiré
                        </span>
                      )}
                      {a.token_status === 'expiring_soon' && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          <AlertCircle size={12} />Expire bientôt
                        </span>
                      )}
                      {a.token_status === 'valid' && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={12} />Actif
                        </span>
                      )}
                      <button onClick={() => { if(confirm('Déconnecter ce compte ?')) disconnect.mutate(a.id) }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter un compte */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Connecter un nouveau compte</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(platformDocs).map(platform => {
                const connected = (accounts||[]).some((a: any) => a.platform === platform && a.is_active)
                return (
                  <div key={platform} className={`border-2 rounded-xl p-5 transition-all ${showForm===platform ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: getPlatformColor(platform) }}>
                          {getPlatformLabel(platform)[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{getPlatformLabel(platform)}</p>
                          <p className="text-xs text-gray-500 font-mono">{platformDocs[platform].scope.slice(0,30)}...</p>
                        </div>
                      </div>
                      {connected ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">Connecté ✓</span>
                      ) : (
                        <button onClick={() => setShowForm(showForm===platform ? null : platform)}
                          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                          <Plus size={14} />Connecter
                        </button>
                      )}
                    </div>

                    {showForm === platform && (
                      <div className="mt-4 pt-4 border-t border-brand-200">
                        <div className="bg-white rounded-lg p-3 mb-4">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Instructions :</p>
                          {platformDocs[platform].steps.map((s, i) => (
                            <p key={i} className="text-xs text-gray-500 mb-1">{i+1}. {s}</p>
                          ))}
                        </div>
                        {platform === 'facebook' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Page Access Token *</label>
                              <input className="input text-sm" placeholder="EAA..." value={formData.token||''} onChange={e => setFormData({...formData, token: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Page ID *</label>
                              <input className="input text-sm" placeholder="123456789" value={formData.page_id||''} onChange={e => setFormData({...formData, page_id: e.target.value})} />
                            </div>
                            <button onClick={() => handleConnect(platform)} disabled={connectFb.isPending || !formData.token || !formData.page_id}
                              className="btn-primary w-full text-sm py-2">
                              {connectFb.isPending ? 'Connexion...' : 'Connecter Facebook'}
                            </button>
                          </div>
                        )}
                        {platform !== 'facebook' && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs text-orange-700">La connexion {getPlatformLabel(platform)} sera disponible prochainement. Suivez les instructions ci-dessus pour préparer vos credentials.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
