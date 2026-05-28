import { getPlatformColor, getPlatformLabel } from '@/lib/utils'
export default function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    facebook: 'bg-blue-100 text-blue-700', instagram: 'bg-pink-100 text-pink-700',
    tiktok: 'bg-gray-900 text-white', whatsapp: 'bg-green-100 text-green-700'
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[platform] || 'bg-gray-100 text-gray-700'}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: getPlatformColor(platform) }} />
      {getPlatformLabel(platform)}
    </span>
  )
}
