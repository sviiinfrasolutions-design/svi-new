import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SVI Infra Solutions',
  description: 'Read the privacy policy of SVI Infra Solutions to understand how we handle your data and protect your privacy.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
