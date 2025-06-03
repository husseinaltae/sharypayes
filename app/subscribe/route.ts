// /app/api/subscribe/route.ts (Next.js 13+ example)

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      officeId,
      email,
      subscriptionPlan,
      subscriptionStart,
      subscriptionEnd,
      subscriptionStatus = 'active',
      role = 'office_admin',
      isActive = true,
      autoRenew = false,
    } = body;

    if (!officeId || !email || !subscriptionStart || !subscriptionEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.from('office_activities').insert({
      office_id: officeId,
      email,
      subscription_plan: subscriptionPlan,
      subscription_start: subscriptionStart,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus,
      role,
      is_active: isActive,
      auto_renew: autoRenew,
      subscription_expires_at: subscriptionEnd, // usually same as subscription_end
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
