'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-6 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <Link
          href="/employees"
          className="block bg-white shadow p-6 rounded-2xl hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold mb-2">إدارة الموظفين</h2>
          <p className="text-gray-500">إضافة، تعديل، أو عرض سجلات الموظفين</p>
        </Link>

        <Link
          href="/payments"
          className="block bg-white shadow p-6 rounded-2xl hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold mb-2">الرواتب</h2>
          <p className="text-gray-500">إدارة المدفوعات وحسابات الرواتب</p>
        </Link>

        <Link
          href="/promotions"
          className="block bg-white shadow p-6 rounded-2xl hover:bg-gray-100 transition"
        >
          <h2 className="text-xl font-semibold mb-2">الترقيات</h2>
          <p className="text-gray-500">تسجيل الترقيات وتعديل بيانات الموظفين</p>
        </Link>

        {/* Add more quick action cards here */}
      </section>

      {/* Additional Sections (if any) */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">أحدث الأخبار أو الإشعارات</h2>
        <p className="text-gray-600">لا توجد إشعارات جديدة حالياً.</p>
      </section>
    </main>
  );
}
