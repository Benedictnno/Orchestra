import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orchestra — Programmable ATM Card Orchestration Platform',
  description:
    'Unify all your Nigerian bank cards into a single programmable payment layer. Intelligent auto-split transaction routing, merchant-locked virtual cards, and corporate expense controls built on programmable switching rails.',
  keywords: [
    'ATM card orchestration',
    'Nigeria fintech',
    'card switching rails',
    'multi-card split routing',
    'virtual cards',
    'Nigerian banking',
    'corporate expense cards',
  ],
  openGraph: {
    title: 'Orchestra — Programmable ATM Card Orchestration Platform',
    description:
      'Intelligent multi-card split routing, merchant-locked virtual cards, and corporate treasury management built for Nigerian commerce.',
    url: 'https://orchestra-drab.vercel.app',
    siteName: 'Orchestra',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orchestra — Programmable ATM Card Orchestration Platform',
    description:
      'Eliminate POS card declines with intelligent multi-card routing and virtual cards for Nigerian banking.',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
