export async function signInAction(formData: FormData) {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}
