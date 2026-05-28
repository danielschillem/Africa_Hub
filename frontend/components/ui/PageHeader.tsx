interface Props { title: string; desc?: string; action?: React.ReactNode }
export default function PageHeader({ title, desc, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {desc && <p className="text-gray-500 text-sm mt-1">{desc}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
