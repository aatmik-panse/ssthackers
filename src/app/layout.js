import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SST Hackers - Scaler School of Technology Community',
  description: 'A Hacker News-style community platform for SST students and alumni',
  keywords: ['SST', 'Scaler', 'community', 'tech', 'programming', 'discussions'],
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-screen bg-background">
              {/* Simple clean background */}
              <div className="fixed inset-0 -z-10 h-full w-full bg-background dark:bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000A_1px,transparent_1px),linear-gradient(to_bottom,#0000000A_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FFFFFF15_1px,transparent_1px),linear-gradient(to_bottom,#FFFFFF15_1px,transparent_1px)] bg-[size:32px_32px]"></div>
              </div>
              
              <Navbar />
              <main className="container mx-auto px-4 py-6">
                <div className="mx-auto max-w-6xl">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
