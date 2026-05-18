import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Completed Projects - SVI Infra Solutions Portfolio',
  description: 'Browse our successfully completed real estate projects. See the quality, design, and legacy of excellence delivered by SVI Infra Solutions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
