import React, { useState, useEffect } from 'react';
import { contentApi } from '../api/content';
import type { FAQItem } from '../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/FeedbackStates';

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['All', 'GENERAL', 'PARENTS', 'TUTORS'];

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await contentApi.getFAQs();
        setFaqs(data);
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filtered = selectedCategory === 'All'
    ? faqs
    : faqs.filter((f: FAQItem) => f.category === selectedCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center & FAQs
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about tutor matching, verification security, trial classes, and payments.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'GENERAL' ? 'General' : cat === 'PARENTS' ? 'For Parents' : cat === 'TUTORS' ? 'For Tutors' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        {loading ? (
          <LoadingSkeleton count={4} type="row" />
        ) : (
          <div className="space-y-4">
            {filtered.map((item: FAQItem, idx: number) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle transition-all duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-brand-600 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{item.question}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 animate-in fade-in duration-200">
                      <p className="pt-4">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
