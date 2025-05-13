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
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="w-full max-w-6xl">
              {/* ✅ Custom Header */}
              <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-blue-600">
                  <Link href="/">ShahryPays</Link>
                </h1>
                <nav className="flex gap-4 text-sm">
                  <Link href="/employees" className="hover:underline">
                    Employees
                  </Link>
                  <Link href="/reports" className="hover:underline">
                    Reports
                  </Link>
                  <Link href="/payments" className="hover:underline">
                    Payments
                  </Link>
                  <Link href="/notes" className="hover:underline">
                    Notes
                  </Link>

                  <Link href="/history" className="hover:underline">
                    History
                  </Link>
                </nav>
              </header>

              {/* ✅ Page Content */}
              <div className="p-6">{children}</div>

              {/* ✅ Footer */}
              <footer className="w-full text-center text-xs border-t py-6 text-gray-500">
                Powered by{" "}
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
