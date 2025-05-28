'use client'

import { useEffect, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function OfficesListPage() {
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const fetchOffices = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('offices')
        .select('id, name, email, phone_number, subscription_expires_at')

      if (error) {
        console.error('Failed to fetch offices:', error.message)
      } else {
        setOffices(data)
      }
      setLoading(false)
    }

    fetchOffices()
  }, [])

  const handleExtend = async (officeId: string) => {
    startTransition(async () => {
      await fetch('/api/offices/extend', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officeId }),
      })

      // Re-fetch data after update
      const supabase = createClient()
      const { data } = await supabase
        .from('offices')
        .select('id, name, email, phone_number, subscription_expires_at')

      setOffices(data || [])
    })
  }

  const now = new Date()

  if (loading) return <p>جار التحميل...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">قائمة المكاتب</h1>

      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">الاسم</th>
            <th className="border px-3 py-2">البريد الإلكتروني</th>
            <th className="border px-3 py-2">رقم الهاتف</th>
            <th className="border px-3 py-2">انتهاء الاشتراك</th>
            <th className="border px-3 py-2">الحالة</th>
            <th className="border px-3 py-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {offices.map((office) => {
            const expired =
              office.subscription_expires_at &&
              new Date(office.subscription_expires_at) < now

            return (
              <tr key={office.id} className={expired ? 'bg-red-50' : 'bg-green-50'}>
                <td className="border px-3 py-2">{office.name}</td>
                <td className="border px-3 py-2">{office.email}</td>
                <td className="border px-3 py-2">{office.phone_number}</td>
                <td className="border px-3 py-2">
                  {office.subscription_expires_at
                    ? format(new Date(office.subscription_expires_at), 'yyyy-MM-dd')
                    : 'غير محدد'}
                </td>
                <td className="border px-3 py-2 font-semibold">
                  {expired ? 'منتهي' : 'نشط'}
                </td>
                <td className="border px-3 py-2">
                  {expired && (
                    <button
                      onClick={() => handleExtend(office.id)}
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      {isPending ? 'جاري التفعيل...' : 'تفعيل 30 يوم'}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
