import type { ReactNode } from 'react';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'ReleaseOps',
    template: '%s · ReleaseOps',
  },
  description:
    'Client portal and work-order management for small agencies and IT service teams.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
