'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client-side validation
    if (!email || !mobile.match(/^\d{11}$/)) {
      setError('يرجى إدخال بريد إلكتروني صحيح ورقم هاتف مكون من 11 رقمًا')
      return
    }

    // Attempt sign-in (you can implement your own logic, this is a placeholder)
    const { data, error: dbError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('mobile', mobile)
      .single()

    if (dbError || !data) {
      setError('بيانات الدخول غير صحيحة')
    } else {
      // If valid, redirect or set session
      router.push('/home') // Adjust this to your target route
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl mb-4 text-center font-bold">تسجيل الدخول</h2>
      <form onSubmit={handleSignIn}>
        <div className="mb-4">
          <label className="block mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">رقم الهاتف</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            pattern="\d{11}"
            maxLength={11}
            inputMode="numeric"
            className="w-full p-2 border rounded"
            title="رقم الهاتف يجب أن يكون 11 رقمًا"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          دخول
        </button>
      </form>
    </div>
  )
}
