import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';

export const metadata: Metadata = {
  title: 'TodoApp - Manage Your Tasks with Elegance',
  description:
    'A beautifully designed task management app that helps you stay organized, focused, and productive. Simple, fast, and delightful to use.',
  openGraph: {
    title: 'TodoApp - Manage Your Tasks with Elegance',
    description:
      'A beautifully designed task management app that helps you stay organized, focused, and productive.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
