'use server'

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const { officeId } = await req.json()
  const supabase = await createClient()

  // ✅ Get current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'لم يتم العثور على المستخدم' }, { status: 401 })
  }

  // ✅ Calculate new subscription expiry date (30 days from now)
  const newDate = new Date()
  newDate.setDate(newDate.getDate() + 30)

  // ✅ Update the office's subscription expiry date
  const { error: updateError } = await supabase
    .from('offices')
    .update({ subscription_expires_at: newDate.toISOString() })
    .eq('id', officeId)

  if (updateError) {
    return NextResponse.json({ error: `خطأ في تحديث الاشتراك: ${updateError.message}` }, { status: 500 })
  }

  // ✅ Log activation to `office_activations`
  const { error: logError } = await supabase
    .from('office_activations')
    .insert({
      admin_id: user.id,
      office_id: officeId,
      activated_at: new Date().toISOString(), // optional: explicitly log timestamp
    })

  if (logError) {
    console.error('خطأ في تسجيل التنشيط:', logError)
    // Still return success, but mention logging issue
    return NextResponse.json({
      success: true,
      warning: 'تم التمديد بنجاح، ولكن لم يتم تسجيل التنشيط في السجل.',
    })
  }

  // ✅ Success
  return NextResponse.json({ success: true, message: 'تم تمديد الاشتراك وتسجيل التنشيط بنجاح.' })
}
