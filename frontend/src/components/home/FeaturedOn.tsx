import React from 'react';
import { Newspaper } from 'lucide-react';

const FEATURED_PUBLICATIONS = [
  { name: 'The Daily Star', logoText: 'THE DAILY STAR', subtitle: 'Leading English Daily' },
  { name: 'Prothom Alo', logoText: 'প্রথম আলো', subtitle: 'Leading National Daily' },
  { name: 'Dhaka Tribune', logoText: 'Dhaka Tribune', subtitle: 'National News Media' },
  { name: 'The Business Standard', logoText: 'TBS NEWS', subtitle: 'Business & EdTech' }
];

export const FeaturedOn: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <Newspaper className="w-4 h-4 text-brand-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Recognized & Featured In National Media
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          {FEATURED_PUBLICATIONS.map((pub, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 hover:scale-105 transition-transform"
            >
              <span className="text-lg md:text-xl font-black text-slate-800 tracking-tight font-heading">
                {pub.logoText}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {pub.subtitle}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
