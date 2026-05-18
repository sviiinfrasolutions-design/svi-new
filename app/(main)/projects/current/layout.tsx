import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Current Projects - SVI Infra Solutions',
  description: 'View our ongoing premium real estate projects. Invest in the future with SVI Infra Solutions in prime locations with high appreciation potential.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
