// app/layout.tsx
import AuthStatus from '@/components/AuthStatus'
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast"; // ✅ NEW: Import toast component
import "./globals.css";
{/*import { AuthButton } from "@/components/AuthButton";*/}


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ShahryPays",
  description: "Payroll system powered by Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="ar" dir="rtl" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="w-full max-w-6xl">
              {/* ✅ Arabic Header with RTL and Responsive Design */}
              <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-6 sm:py-10" dir="rtl">  
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    <Link href="/">شهري إن</Link>
                  </div>
                  <AuthStatus />
                </div>

                <nav className="w-full bg-gray-800 overflow-hidden">
                  <div className="flex flex-wrap justify-center">
                    <Link href="/home" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">الرئيسية</Link>
                    {/* <Link href="/offices_list" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">المؤسسات</Link> */}
                    {/*<Link href="/employees/new" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">اضافة موظف</Link>*/}
                    <Link href="/employees/report" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">تقرير الموظفين</Link>
                    {/*<Link href="/payments" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">اضافة راتب</Link>*/}
                    <Link href="/payments/report" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">تقرير الراتب</Link>
                    <Link href="/retire-report" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">استقطاع تقاعدي</Link>
                    <Link href="/promotions" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">الترقيات</Link>
                    <Link href="/report-tax" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">تقرير الضريبة</Link>
                    {/*<Link href="/pricing" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">الاشتراك</Link>*/}
                    <Link href="/users" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">users</Link>
                    <Link href="/registration" className="text-white text-sm sm:text-base px-4 py-3 hover:bg-gray-300 hover:text-black">نسخة التسجيل</Link>
                    
                  </div>
                </nav>
              </header>
              <div className="p-4 sm:p-6">{children}</div>
             {/*} <footer className="w-full text-center text-xs border-t py-6 text-gray-500">
                تم التطوير باستخدام{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gray-600 hover:underline"
                >
                  Supabase
                </a>
              </footer>*/}
            </div>
          </main>

          {/* ✅ Toast Container */}
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
