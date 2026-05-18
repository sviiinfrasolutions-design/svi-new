import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SVI Infra Solutions - Our Story & Values',
  description: 'Learn about SVI Infra Solutions Pvt. Ltd., our core values, mission, and our 15+ years of legacy in building premium real estate in Jaipur and Noida.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
