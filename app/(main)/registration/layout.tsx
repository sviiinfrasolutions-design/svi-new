import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Registration & Inquiry | SVI Infra Solutions',
  description: 'Register your interest or inquire about our premium properties. Start your journey to finding the perfect home or investment with SVI Infra Solutions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
