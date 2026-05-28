import { getStatusBadge, getStatusLabel } from '@/lib/utils'
export default function StatusBadge({ status }: { status: string }) {
  return <span className={getStatusBadge(status)}>{getStatusLabel(status)}</span>
}
