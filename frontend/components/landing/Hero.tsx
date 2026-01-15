import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

export function Hero() {
  return (
    <section className='relative overflow-hidden py-12 sm:py-20 md:py-32'>
      {/* Decorative stickers - hidden on mobile for cleaner look */}
      <div className='sticker top-20 left-10 text-4xl hidden sm:block'>✨</div>
      <div className='sticker top-40 right-20 text-3xl hidden sm:block' style={{animationDelay: '-0.5s'}}>🚀</div>
      <div className='sticker bottom-40 left-20 text-3xl hidden md:block' style={{animationDelay: '-1s'}}>💫</div>
      <div className='sticker bottom-20 right-10 text-4xl hidden md:block' style={{animationDelay: '-1.5s'}}>⭐</div>

      <div className='container mx-auto px-4 relative'>
        <div className='max-w-3xl mx-auto text-center'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full text-sm font-medium text-primary dark:text-primary-light mb-6 border border-primary/30'>
            <span>✨</span>
            Boost your productivity
          </div>

          {/* Headline */}
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-display'>
            <span className='text-light-500 dark:text-white'>Manage Your Tasks with </span>
            <span className='gradient-text'>Style</span>
            <span className='text-4xl ml-2'>🎨</span>
          </h1>

          {/* Subheadline */}
          <p className='text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto'>
            A stunning, cinematic task management app with beautiful animations, 
            dark mode, and a delightful user experience. ✨
          </p>

          {/* CTAs */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'>
            <Link href={ROUTES.SIGNUP} className='w-full sm:w-auto'>
              <Button size='lg' className='w-full min-h-[52px] sm:min-h-[48px]'>
                Get Started Free 🚀
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN} className='w-full sm:w-auto'>
              <Button variant='secondary' size='lg' className='w-full min-h-[52px] sm:min-h-[48px]'>
                Sign In 👋
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className='mt-8 text-sm text-gray-500 dark:text-gray-500'>
            No credit card required • Start organizing in seconds 💖
          </p>
        </div>

        {/* Hero Preview */}
        <div className='mt-16 relative max-w-4xl mx-auto'>
          <div className='glass rounded-2xl overflow-hidden card-cinematic'>
            {/* Window controls */}
            <div className='bg-dark-200/50 dark:bg-dark-200 px-4 py-3 border-b border-dark-border flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-red-400' />
              <div className='w-3 h-3 rounded-full bg-yellow-400' />
              <div className='w-3 h-3 rounded-full bg-green-400' />
              <span className='ml-4 text-xs text-gray-500'>TodoApp</span>
            </div>
            
            <div className='p-6 md:p-8 bg-dark-100/30 dark:bg-dark-100'>
              {/* Mock task list */}
              <div className='space-y-3'>
                {[
                  { title: 'Complete project proposal', done: true, emoji: '📝' },
                  { title: 'Review design mockups', done: true, emoji: '🎨' },
                  { title: 'Schedule team meeting', done: false, emoji: '📅' },
                  { title: 'Update documentation', done: false, emoji: '📚' },
                ].map((task, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-3 p-3 bg-dark-card/50 dark:bg-dark-card rounded-xl border border-dark-border/50 hover:border-primary/50 transition-all duration-300'
                    style={{animationDelay: i * 0.1 + 's'}}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                        task.done
                          ? 'bg-gradient-to-r from-primary to-secondary border-transparent'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {task.done && (
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='3'>
                          <polyline points='20,6 9,17 4,12' />
                        </svg>
                      )}
                    </div>
                    <span className='mr-2'>{task.emoji}</span>
                    <span
                      className={`flex-1 ${
                        task.done
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className='absolute -top-4 -right-4 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-medium shadow-glow-pink hidden md:flex items-center gap-2 animate-float'>
            <span>🎉</span> 2 tasks done!
          </div>
          
          {/* Another floating element */}
          <div className='absolute -bottom-4 -left-4 bg-gradient-to-r from-secondary to-accent text-white px-4 py-2 rounded-full text-sm font-medium shadow-glow-purple hidden md:flex items-center gap-2 animate-float' style={{animationDelay: '-3s'}}>
            <span>💜</span> Dark mode
          </div>
        </div>
      </div>
    </section>
  );
}
