import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SVI Infra Solutions',
  description: 'Read the terms and conditions for using the SVI Infra Solutions website and engaging with our real estate services.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
