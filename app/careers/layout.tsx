import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at SVI Infra Solutions - Join Our Team',
  description: 'Join SVI Infra Solutions and build a rewarding career in real estate development. Explore current job openings and opportunities.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
