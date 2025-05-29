'use client'

import { useEffect, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function OfficesListPage() {
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const router = useRouter()

  const fetchOffices = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('offices')
      .select('id, name, email, phone_number, subscription_expires_at')

    if (error) {
      console.error('فشل في جلب المكاتب:', error.message)
    } else {
      setOffices(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const handleExtend = async (officeId: string) => {
    setStatusMap((prev) => ({ ...prev, [officeId]: 'جاري التفعيل...' }))

    startTransition(async () => {
      try {
        const res = await fetch('/offices_extend', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officeId }),
        })

        const result = await res.json()

        if (!res.ok) {
          setStatusMap((prev) => ({
            ...prev,
            [officeId]: `❌ ${result.error || 'فشل التفعيل'}`,
          }))
        } else {
          setStatusMap((prev) => ({
            ...prev,
            [officeId]: '✅ تم التمديد',
          }))
          // Refresh the office list
          await fetchOffices()
        }
      } catch (error) {
        setStatusMap((prev) => ({
          ...prev,
          [officeId]: '❌ خطأ في الاتصال بالخادم',
        }))
      }
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
                <td className="border px-3 py-2 space-y-1">
                  {expired && (
                    <button
                      onClick={() => handleExtend(office.id)}
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded w-full"
                    >
                      {statusMap[office.id] || 'تفعيل 30 يوم'}
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
