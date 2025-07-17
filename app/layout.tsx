import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'AI Interest - Discover AI Generated Art & Images',
  description: 'Explore a gallery of AI-generated images and art. Discover, save, and share your favorite AI creations on AI Interest.',
  generator: 'AI Interest',
  openGraph: {
    title: 'AI Interest - Discover AI Generated Art & Images',
    description: 'Explore a gallery of AI-generated images and art. Discover, save, and share your favorite AI creations on AI Interest.',
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/', // Replace with your actual domain
    siteName: 'AI Interest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Interest - Discover AI Generated Art & Images',
    description: 'Explore a gallery of AI-generated images and art. Discover, save, and share your favorite AI creations on AI Interest.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
