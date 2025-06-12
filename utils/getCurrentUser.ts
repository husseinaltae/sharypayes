import { createClient } from '@/utils/supabase/client';

export const getCurrentUser = async (userEmail: string, userMobile: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, email, office_id, offices(name)')
    .eq('email', userEmail)
    .eq('mobile', userMobile)
    .single();

  if (error) {
    console.error('Failed to fetch user info:', error.message);
    return null;
  }

  return {
    userId: data?.id,
    userOfficeId: data?.office_id,
    userOfficeName: data?.offices?.[0]?.name,
  };
};
