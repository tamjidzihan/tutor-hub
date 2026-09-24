import React from 'react';
import { Headphones, Zap, ShieldCheck, Trophy, CheckCircle } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      title: '24/7 Live Support',
      desc: 'Our dedicated customer success team is available via phone, live chat, and WhatsApp to assist parents and tutors promptly.',
      icon: <Headphones className="w-6 h-6 text-brand-600" />
    },
    {
      title: 'Fast Responsive Matching',
      desc: 'Receive verified tutor profiles within 2-4 hours of submitting your requirement. Zero waiting around for weeks.',
      icon: <Zap className="w-6 h-6 text-amber-600" />
    },
    {
      title: 'Safe & Verified Community',
      desc: 'Rigorous multi-layer background verification: National ID (NID), University Student ID, and police record checks.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      title: 'Better than Traditional Media',
      desc: 'No middleman exploitation, no unrealistic commission cuts. Direct, transparent agreements with free replacement support.',
      icon: <Trophy className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full mb-2">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Built for Academic Excellence & Total Safety
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Here is why over 48,000+ educators and 35,000+ guardians make TutorHub their first choice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-1.5 text-xs font-bold text-brand-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Guaranteed Standard</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
