import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact SVI Infra Solutions | Get in Touch',
  description: 'Contact SVI Infra Solutions for inquiries about our premium residential and commercial properties. We are here to help you find your dream home or investment.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
