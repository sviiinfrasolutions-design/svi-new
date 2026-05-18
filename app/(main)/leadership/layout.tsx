import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Leadership Team | SVI Infra Solutions',
  description: 'Meet the experienced and visionary leadership team behind SVI Infra Solutions, driving innovation and excellence in real estate.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
