import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | SVI Infra Solutions',
  description: 'Find answers to common questions about buying property, investments, and our real estate projects at SVI Infra Solutions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
