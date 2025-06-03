'use server'

import { createClient } from '@/utils/supabase/client'

export async function signInAction(_: any, formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email')?.toString() || ''
  const password = formData.get('password')?.toString() || ''

  if (!email || !password) {
    return { error: 'البريد الإلكتروني وكلمة المرور مطلوبة.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'بيانات الدخول غير صحيحة.' }
  }

  return { successRedirect: true }
}
