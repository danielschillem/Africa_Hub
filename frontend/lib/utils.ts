import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA'
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export function getPlatformColor(platform: string): string {
  return { facebook: '#1877F2', instagram: '#E1306C', tiktok: '#000000', whatsapp: '#25D366' }[platform] || '#6B7280'
}

export function getPlatformLabel(platform: string): string {
  return { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', whatsapp: 'WhatsApp' }[platform] || platform
}

export function getStatusBadge(status: string): string {
  return {
    draft: 'badge-gray', scheduled: 'badge-blue', publishing: 'badge-yellow',
    published: 'badge-green', failed: 'badge-red', cancelled: 'badge-gray',
    active: 'badge-green', paused: 'badge-yellow', sending: 'badge-yellow', sent: 'badge-green',
  }[status] || 'badge-gray'
}

export function getStatusLabel(status: string): string {
  return {
    draft: 'Brouillon', scheduled: 'Programmé', publishing: 'En cours',
    published: 'Publié', failed: 'Échoué', cancelled: 'Annulé',
    active: 'Actif', paused: 'En pause', sending: 'Envoi en cours', sent: 'Envoyé',
  }[status] || status
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '...' : str
}
