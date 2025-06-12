'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <main dir="rtl" className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          مرحبًا بك في نظام الرواتب الخاص بك
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
          إدارة الرواتب، الترقيات، والتقارير في مكان واحد. آمن، سريع، ومصمم ليتناسب مع سير عملك.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/sign-up">
            ابدأ الآن <ArrowRight size={20} />
          </Link>
        </Button>
      </section>

      {/* Instructions Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* <h2 className="text-3xl font-semibold mb-8">كيفية استخدام النظام</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="font-bold text-lg mb-2">١. إنشاء حساب</h3>
              <p className="text-gray-600 dark:text-gray-300">سجّل باستخدام   البريد الإلكتروني  و كلمة المرور الخاصة بك    .</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="font-bold text-lg mb-2">٢. إدارة البيانات</h3>
              <p className="text-gray-600 dark:text-gray-300">أضف أو استعرض بيانات الرواتب، الترقيات، والتقارير.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="font-bold text-lg mb-2">٣. التصدير والطباعة</h3>
              <p className="text-gray-600 dark:text-gray-300">قم بتصدير التقارير بصيغة PDF   واطبعها للاستخدام الرسمي.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
