import type { ReactNode } from 'react';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow-condensed',
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

const DIRECTION_COMMENT = `<!--
THESIS: The work queue is a departure board, not a metric dashboard. Refuse four equal stat cards and cream-serif SaaS chrome.
OWN-WORLD: Cool fluorescent paper, steel rail header, hairline columns, Barlow + Barlow Condensed, amber lamp for live/urgent.
STORY: Sign in, scan the board, open a row, act. Presence is a lamp, not a party.
FIRST VIEWPORT: Dark rail with wordmark, nav, live lamp; board of titled rows with assignee, age, status, priority; New ticket on the rail.
FORM: Railway timetable / departure board. Seed cee50420, grounded candidate 5. Degraded roll, no challengers.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${barlowCondensed.variable} font-sans antialiased`}>
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_COMMENT }} />
        {children}
      </body>
    </html>
  );
}
