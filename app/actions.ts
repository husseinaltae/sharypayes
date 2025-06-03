'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/utils/supabase/server';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      type: 'error',
      text: 'بيانات الدخول غير صحيحة',
    };
  }

  // ✅ Redirect to dashboard on success
  redirect('/dashboard');
}
