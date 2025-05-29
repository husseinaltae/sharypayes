import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Handle PATCH method
export async function PATCH(req: Request) {
  const supabase = await createClient()

  try {
    const { officeId } = await req.json()

    if (!officeId) {
      return NextResponse.json({ error: 'رقم المكتب مفقود' }, { status: 400 })
    }

    // Get current office
    const { data: office, error: fetchError } = await supabase
      .from('offices')
      .select('subscription_expires_at')
      .eq('id', officeId)
      .single()

    if (fetchError || !office) {
      return NextResponse.json({ error: 'لم يتم العثور على المكتب' }, { status: 404 })
    }

    // Calculate new expiration date
    const currentDate = new Date()
    const existingDate = office.subscription_expires_at
      ? new Date(office.subscription_expires_at)
      : null

    const baseDate = existingDate && existingDate > currentDate ? existingDate : currentDate
    const newDate = new Date(baseDate)
    newDate.setDate(newDate.getDate() + 30)

    const { error: updateError } = await supabase
      .from('offices')
      .update({ subscription_expires_at: newDate.toISOString() })
      .eq('id', officeId)

    if (updateError) {
      return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 })
    }

    return NextResponse.json({ success: true, newDate })
  } catch (e) {
    console.error('حدث خطأ:', e)
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
