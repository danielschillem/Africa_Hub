import { LucideIcon } from 'lucide-react'
interface Props { icon: LucideIcon; title: string; desc: string; action?: { label: string; onClick: () => void } }
export default function EmptyState({ icon: Icon, title, desc, action }: Props) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{desc}</p>
      {action && <button onClick={action.onClick} className="btn-primary">{action.label}</button>}
    </div>
  )
}
