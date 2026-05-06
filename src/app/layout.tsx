import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GPT Image 2 WebUI',
  description: 'Web interface for GPT Image 2 generation via KIE API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] min-h-screen text-white`}>
        <AppSidebar />
        <MobileHeader />
        <main className="lg:ml-60 mt-12 lg:mt-0 p-4 lg:p-6 transition-all duration-300">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
