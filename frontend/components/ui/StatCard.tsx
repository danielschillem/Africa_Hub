interface StatCardProps { title: string; value: string | number; change?: string; positive?: boolean; icon?: React.ReactNode; color?: string }
export default function StatCard({ title, value, change, positive, icon, color = 'brand' }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {icon && <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center text-${color}-600`}>{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{positive ? '↑' : '↓'} {change}</p>}
    </div>
  )
}
