'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function signUpAction(formData: FormData) {
  const supabase = createClient();

  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const id_number = formData.get('id_number') as string;
  const email = formData.get('email') as string;
  const mobile = formData.get('mobile') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  // Step 1: Sign up in Supabase Auth
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: `فشل إنشاء الحساب: ${authError.message}` };
  }

  const authUserId = data.user?.id;
  if (!authUserId) {
    return { error: 'فشل في الحصول على هوية المستخدم.' };
  }

  // Step 2: Insert into public.users table
  const { error: insertError } = await supabase.from('users').insert({
    id: authUserId,
    first_name,
    last_name,
    id_number,
    email,
    mobile,
    role,
  });

  if (insertError) {
    return { error: `فشل في حفظ بيانات المستخدم: ${insertError.message}` };
  }

  // Step 3: Redirect to login page
  redirect('/sign-in');
}
