'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { token } = useAppStore()
  useEffect(() => { router.push(token ? '/dashboard' : '/auth/login') }, [token, router])
  return <div className="min-h-screen bg-brand-500 flex items-center justify-center"><div className="text-white text-2xl font-bold">AFRIHUB</div></div>
}
