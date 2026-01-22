'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/bill')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-2xl text-gray-600">Redirecting...</div>
    </div>
  )
}
