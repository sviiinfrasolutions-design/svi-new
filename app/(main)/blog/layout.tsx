import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Blog & Insights | SVI Infra Solutions',
  description: 'Read the latest news, insights, and market trends in the real estate sector from the experts at SVI Infra Solutions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
