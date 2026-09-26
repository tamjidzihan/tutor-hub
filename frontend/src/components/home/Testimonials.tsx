import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Star,
  Quote,
  Heart,
  GraduationCap,
  Building2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  BadgeCheck,
} from 'lucide-react';
import { contentApi } from '../../api/content';
import type { Testimonial } from '../../types';
import { LoadingSkeleton } from '../common/FeedbackStates';

type TabKey = 'PARENT' | 'TUTOR' | 'STAKEHOLDER';

const TABS: {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  headline: string;
  sub: string;
}[] = [
    {
      key: 'PARENT',
      label: 'Parents & Students',
      shortLabel: 'Parents',
      icon: <Heart className="w-4 h-4" />,
      headline: 'Real Parents. Real Progress.',
      sub: 'Read firsthand experiences from families across Bangladesh who found the right tutor through us.',
    },
    {
      key: 'TUTOR',
      label: 'Tutors & Mentors',
      shortLabel: 'Tutors',
      icon: <GraduationCap className="w-4 h-4" />,
      headline: 'Real Tutors. Real Impact.',
      sub: 'University scholars and mentors share how they build careers while shaping the next generation.',
    },
    {
      key: 'STAKEHOLDER',
      label: 'Stakeholders & Advisors',
      shortLabel: 'Advisors',
      icon: <Building2 className="w-4 h-4" />,
      headline: 'Trusted by Academic Leaders.',
      sub: 'Statements and endorsements from educators, advisors, and institutional partners.',
    },
  ];

export const Testimonials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('PARENT');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = useMemo(
    () => TABS.find((t) => t.key === activeTab)!,
    [activeTab]
  );

  useEffect(() => {
    let cancelled = false;
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contentApi.getTestimonials(activeTab);
        if (!cancelled) {
          setTestimonials(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load testimonials:', err);
          setError('Could not load testimonials from backend. Please try again.');
          setTestimonials([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTestimonials();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section className="relative py-16 sm:py-20 bg-linear-to-b border-b border-slate-200/80 overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-100/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-[11px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 border border-brand-200/70 px-3 py-1 rounded-full mb-3">
            Social Proof & Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            {activeConfig.headline}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            {activeConfig.sub}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Testimonial categories"
            className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-full overflow-x-auto"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <span className={isActive ? 'text-white' : 'text-brand-500'}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-rose-200 max-w-lg mx-auto">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <EmptyState />
        ) : (
          <TestimonialCarousel items={testimonials} />
        )}
      </div>
    </section>
  );
};

/* ------------------------------ Carousel Core ----------------------------- */

const TestimonialCarousel: React.FC<{ items: Testimonial[] }> = ({ items }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track scroll position for dots
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth ?? 1;
    const gap = 24; // matches gap-6
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(0, idx), items.length - 1));
  }, [items.length]);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth ?? 320;
    const gap = 24;
    const step = cardWidth + gap;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (maxScroll <= 0) return;

    if (dir === 1) {
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  }, []);

  const paused = isPaused || isHovered;

  // Auto-play timer: automatically advances to next card every 3.5 seconds
  useEffect(() => {
    if (paused || items.length <= 1) return;

    const interval = setInterval(() => {
      scrollByCard(1);
    }, 3500);

    return () => clearInterval(interval);
  }, [paused, items.length, scrollByCard]);

  // Reset scroll when items change
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [items]);

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') scrollByCard(1);
    if (e.key === 'ArrowLeft') scrollByCard(-1);
  };

  const visibleDotsCount = Math.min(items.length, 10);

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-linear-to-r from-slate-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-linear-to-l from-slate-50 to-transparent z-10" />

      {/* Top controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-medium text-slate-400">
          <span>{paused ? 'Paused' : 'Auto-playing'}</span>
          <span className="hidden sm:inline text-slate-300"> • Hover or pause anytime</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
            title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 shadow-xs hover:shadow-sm transition-all"
          >
            {isPaused ? <Play className="w-4 h-4 ml-0.5 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous testimonial"
            title="Previous"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 shadow-xs hover:shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonial"
            title="Next"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 shadow-xs hover:shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Testimonials carousel"
        className="testimonial-scroller flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth focus:outline-none scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-transform duration-300"
          >
            <TestimonialCard item={item} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap max-w-md mx-auto">
        {items.slice(0, visibleDotsCount).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            onClick={() => {
              const el = scrollerRef.current;
              if (!el) return;
              const firstCard = el.firstElementChild as HTMLElement | null;
              const cardWidth = firstCard?.clientWidth ?? 320;
              const gap = 24;
              el.scrollTo({ left: i * (cardWidth + gap), behavior: 'smooth' });
            }}
            className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex
              ? 'w-7 bg-brand-500 shadow-xs shadow-brand-500/40'
              : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

/* --------------------------------- Card ----------------------------------- */

const TestimonialCard: React.FC<{ item: Testimonial }> = ({ item }) => {
  const rating = item.rating ?? 5;
  return (
    <div className="group h-full p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-200'
                  }`}
              />
            ))}
            <span className="ml-1.5 text-[11px] font-bold text-slate-400">
              {rating}.0
            </span>
          </div>
          <Quote className="w-7 h-7 text-brand-200 group-hover:text-brand-300 transition-colors" />
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-6 line-clamp-5">
          "{item.quote}"
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <div className="relative shrink-0">
          <img
            src={item.avatar}
            alt={item.name}
            loading="lazy"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-500 ring-2 ring-white">
            <BadgeCheck className="w-2.5 h-2.5 text-white" />
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate">
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 truncate">{item.role}</p>
          <p className="text-[11px] text-brand-700 font-semibold truncate">
            {item.institution_or_location}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Empty State ------------------------------- */

const EmptyState: React.FC = () => (
  <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
      <Quote className="w-5 h-5 text-slate-400" />
    </div>
    <p className="text-sm font-bold text-slate-700">No testimonials yet</p>
    <p className="text-xs text-slate-500 mt-1">
      Stories for this category will appear here once published.
    </p>
  </div>
);