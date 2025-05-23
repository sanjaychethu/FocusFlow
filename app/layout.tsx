import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppDataProvider } from '@/providers/app-data-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Focusflow | Productivity Suite',
  description: 'Track habits, manage tasks, and organize your schedule in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppDataProvider>
            {children}
            <Toaster />
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}