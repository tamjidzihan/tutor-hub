import React, { useState, useEffect } from 'react';
import { Star, Quote, Heart, GraduationCap, Building2 } from 'lucide-react';
import { contentApi } from '../../api/content';
import type { Testimonial } from '../../types';
import { LoadingSkeleton } from '../common/FeedbackStates';

export const Testimonials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PARENT' | 'TUTOR' | 'STAKEHOLDER'>('PARENT');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const data = await contentApi.getTestimonials(activeTab);
        setTestimonials(data);
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [activeTab]);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-100 px-3 py-1 rounded-full mb-2">
            Social Proof & Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            {activeTab === 'PARENT' ? 'Real Happy Parents, Real Stories' : activeTab === 'TUTOR' ? 'Real Happy Tutors, Real Stories' : 'Stakeholder & Advisor Statements'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Read firsthand experiences from families, university scholars, and academic leaders across Bangladesh.
          </p>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveTab('PARENT')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'PARENT'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              Parents & Students
            </button>
            <button
              onClick={() => setActiveTab('TUTOR')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'TUTOR'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Tutors & Mentors
            </button>
            <button
              onClick={() => setActiveTab('STAKEHOLDER')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'STAKEHOLDER'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Stakeholders & Advisors
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : testimonials.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">No testimonials published in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-brand-200" />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-400/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.role}</p>
                    <p className="text-[11px] text-brand-700 font-semibold">{item.institution_or_location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
