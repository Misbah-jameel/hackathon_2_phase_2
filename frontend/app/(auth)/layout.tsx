import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className='flex-1 flex items-center justify-center py-12 px-4 relative'>
        {/* Decorative stickers */}
        <div className='sticker top-20 left-10 text-3xl hidden md:block'>🔐</div>
        <div className='sticker top-40 right-20 text-2xl hidden md:block' style={{animationDelay: '-0.5s'}}>✨</div>
        <div className='sticker bottom-40 left-20 text-2xl hidden md:block' style={{animationDelay: '-1s'}}>💜</div>
        <div className='sticker bottom-20 right-10 text-3xl hidden md:block' style={{animationDelay: '-1.5s'}}>🎯</div>
        
        <div className='w-full max-w-md relative z-10'>
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
