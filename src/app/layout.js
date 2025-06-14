import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import dynamic from 'next/dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { ToasterProvider } from '@/components/toaster-provider'
import { Analytics } from "@vercel/analytics/next"

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/navbar').then(mod => mod.Navbar), {
  ssr: true,
  loading: () => <div className="h-16 bg-background border-b"></div>
})

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
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
              <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                <div className="mx-auto max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
            <ToasterProvider />
          </ThemeProvider>
        </SessionProvider>
        <Analytics />

      </body>
    </html>
  )
}
