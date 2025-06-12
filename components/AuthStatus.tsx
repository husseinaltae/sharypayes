'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthStatus() {
  const supabase = createClient()
  const router = useRouter()

  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email ?? null)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in') // or wherever you want to redirect
  }

  return userEmail ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700 dark:text-gray-200">{userEmail}</span>
      <button
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
      >
        تسجيل الخروج
      </button>
    </div>
  ) : (
    <a
      href="/sign-in"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
    >
      تسجيل الدخول
    </a>
  )
}
