// app/layout.tsx
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

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
              {/* ✅ Arabic Header with RTL and Higher Height */}
              <header className="flex justify-between items-center py-6 px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-blue-600">
                  <Link href="/">شهري إن</Link>
                </h1>
                <nav className="flex gap-6 text-sm relative items-center">
                  <Link href="/" className="hover:underline">الرئيسية</Link>
                  <Link href="/about" className="hover:underline">من نحن</Link>
                  <Link href="/services" className="hover:underline">الخدمات</Link>
                  <Link href="/contact" className="hover:underline">اتصل بنا</Link>

                  {/* ✅ Dropdown Menu */}
                  <div className="relative group">
                    <button className="hover:underline">صفحات الموقع</button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <Link href="/employees" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">الموظفون</Link>
                      <Link href="/payments" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">اضافة راتب</Link>
                      <Link href="/reports" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">تقرير الموظفين</Link>
                      <Link href="/payments/reportpdf" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">تقرير الراتب</Link>
                      <Link href="/promotions" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">الترقيات</Link>
                    </div>
                  </div>
                </nav>
              </header>

              {/* ✅ Page Content */}
              <div className="p-6">{children}</div>

              {/* ✅ Footer */}
              <footer className="w-full text-center text-xs border-t py-6 text-gray-500">
                تم التطوير باستخدام{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gray-600 hover:underline"
                >
                  Supabase
                </a>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
