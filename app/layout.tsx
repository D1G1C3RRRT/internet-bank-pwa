import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WebVitals } from '@/components/web-vitals'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#670884',
}

export const metadata: Metadata = {
  title: 'bunq - Bank of The Free',
  description: 'Your secure and simple online banking solution with seamless transfers and account management',
  generator: 'v0.app',
  applicationName: 'bunq',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'bunq',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-black dark:text-white transition-colors duration-300">
        <WebVitals />
        {children}
        <script suppressHydrationWarning>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').catch(err => {
                  console.log('ServiceWorker registration failed: ', err)
                })
              })
            }
          `}
        </script>
      </body>
    </html>
  )
}
