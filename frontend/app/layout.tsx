import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'TodoApp - Cinematic Task Manager',
    template: '%s | TodoApp',
  },
  description:
    'A stunning, cinematic task management application with beautiful animations and dark mode.',
  keywords: ['todo', 'tasks', 'productivity', 'task management', 'dark mode'],
  authors: [{ name: 'TodoApp Team' }],
  creator: 'TodoApp',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#EC4899',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable + " " + poppins.variable + " dark"} suppressHydrationWarning>
      <body className='min-h-screen antialiased transition-colors duration-300'>
        <a href='#main-content' className='skip-to-main'>
          Skip to main content
        </a>
        <Providers>
          <div className='flex flex-col min-h-screen'>
            <main id='main-content' className='flex-1'>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
