import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

export function CTA() {
  return (
    <section className="py-12 sm:py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl">
          <div className="absolute top-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-32 sm:w-64 h-32 sm:h-64 bg-secondary/15 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto">
            Join thousands of productive people who trust TodoApp to manage their
            daily tasks. Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href={ROUTES.SIGNUP} className="w-full sm:w-auto">
              <Button size="lg" className="w-full min-h-[52px] sm:min-h-[48px]">
                Start Free Today
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required. Free forever for personal use.
          </p>
        </div>
      </div>
    </section>
  );
}
