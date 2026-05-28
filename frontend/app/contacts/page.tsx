'use client'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MainLayout from '@/components/layout/MainLayout'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Users, Upload, Plus, Trash2, UserX } from 'lucide-react'

export default function ContactsPage() {
  const qc       = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', tags: '' })
  const fileRef  = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({ queryKey: ['contacts'], queryFn: () => api.get('/contacts').then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/contacts', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Contact ajouté !'); setShowAdd(false); setForm({ name:'',phone:'',email:'',tags:'' }) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => { const fd = new FormData(); fd.append('file', file); return api.post('/contacts/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success(`${d.imported} contacts importés`) },
  })

  const deleteMutation  = useMutation({ mutationFn: (id: number) => api.delete(`/contacts/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) })
  const optOutMutation  = useMutation({ mutationFn: (id: number) => api.post(`/contacts/${id}/opt-out`), onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }) })

  const contacts = data?.data || []

  return (
    <MainLayout>
      <PageHeader title="Contacts WhatsApp" desc={`${data?.total || 0} contacts dans votre base`}
        action={
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2"><Upload size={16} />Importer CSV</button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && importMutation.mutate(e.target.files[0])} />
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />Ajouter</button>
          </div>
        } />

      {/* Format CSV */}
      <div className="card p-4 mb-6 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-700"><strong>Format CSV attendu :</strong> Nom, Téléphone (+226XXXXXXXX), Email (optionnel), Tag (optionnel)</p>
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nouveau contact</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input className="input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Prénom Nom" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label><input className="input" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+22670000000" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input className="input" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="email@exemple.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tag</label><input className="input" value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} placeholder="client, vip, prospect..." /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => createMutation.mutate({ ...form, tags: form.tags ? [form.tags] : [] })} disabled={!form.name||!form.phone} className="btn-primary">Ajouter</button>
          </div>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : contacts.length === 0 ? (
        <EmptyState icon={Users} title="Aucun contact" desc="Importez un CSV ou ajoutez des contacts manuellement."
          action={{ label: 'Ajouter un contact', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Nom','Téléphone','Email','Tags','WhatsApp','Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{c.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{c.email || '—'}</td>
                  <td className="py-3 px-4">{(c.tags||[]).map((t: string) => <span key={t} className="inline-block mr-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{t}</span>)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.whatsapp_opted_in ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.whatsapp_opted_in ? '✓ Abonné' : '✗ Désabonné'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {c.whatsapp_opted_in && <button onClick={() => optOutMutation.mutate(c.id)} className="p-1.5 text-gray-400 hover:text-orange-500 rounded" title="Désabonner WhatsApp"><UserX size={14} /></button>}
                      <button onClick={() => { if(confirm('Supprimer ?')) deleteMutation.mutate(c.id) }} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Supprimer"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  )
}
