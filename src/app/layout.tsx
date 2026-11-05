import type { Metadata, Viewport } from 'next';
import { Amiri, Cinzel, Cormorant_Garamond, Manrope } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

const display = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'], variable: '--font-display' });
const sans = Manrope({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'], variable: '--font-sans' });
const serif = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});
const arabic = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-arabic' });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'NIHĀN Studios — Beyond the known',
  description: 'NIHĀN Studios crafts AI, apps, games and websites. We create worlds worth looking beyond the door for.',
  icons: {
    icon: { url: '/assets/brand/nihan-transparent.png', type: 'image/png' },
    apple: '/assets/brand/nihan-transparent.png',
  },
  openGraph: {
    title: 'NIHĀN Studios — Beyond the known',
    description: 'AI · Apps · Games · Websites. We create worlds worth looking beyond the door for.',
    images: [{ url: '/assets/brand/hidden-gate.jpg', width: 1200, height: 1200 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/assets/brand/hidden-gate.jpg'] },
};

export const viewport: Viewport = {
  themeColor: '#050403',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${serif.variable} ${arabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
