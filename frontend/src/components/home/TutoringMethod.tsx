import React from 'react';
import { Home, Laptop, Users2, Zap, Check } from 'lucide-react';

export const TutoringMethod: React.FC = () => {
  const methods = [
    {
      title: 'Home Tutoring',
      subtitle: 'In-person Personalized 1-to-1 Care',
      desc: 'Tutor visits the student’s residence for dedicated one-on-one attention, hands-on homework checks, and continuous focus.',
      features: ['Personalized pace', 'Direct face-to-face feedback', 'Flexible home timings'],
      icon: <Home className="w-6 h-6 text-brand-600" />,
      badge: 'Most Popular'
    },
    {
      title: 'Online Tutoring',
      subtitle: 'Live Interactive Digital Classroom',
      desc: 'Learn from anywhere in Bangladesh or abroad via high-definition digital whiteboard, recorded lectures, and live doubt clearance.',
      features: ['Learn from BUET/DU anywhere', 'Zero commute time', 'Recorded study sessions'],
      icon: <Laptop className="w-6 h-6 text-sky-600" />,
      badge: 'High Flexibility'
    },
    {
      title: 'Group & Batch Tuition',
      subtitle: 'Collaborative Small Cohorts',
      desc: 'Learn alongside 4 to 8 peers of similar academic levels with healthy peer competition, active discussions, and cost efficiency.',
      features: ['Affordable tuition fee', 'Interactive group discussions', 'Weekly rank model tests'],
      icon: <Users2 className="w-6 h-6 text-purple-600" />,
      badge: 'Cost Effective'
    },
    {
      title: 'Crash & Exam Prep',
      subtitle: 'Intensive Short-Term Booster',
      desc: 'Rapid test paper revision, past paper solving, and formula mastery right before board exams or university admission tests.',
      features: ['High-yield question coverage', 'Mock exam simulations', 'Quick revision notes'],
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      badge: 'Exam Booster'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-100 px-3 py-1 rounded-full mb-2">
            Tutoring Modalities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Choose Your Preferred Tutoring Method
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Flexible delivery formats built to match your lifestyle, curriculum, and learning speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methods.map((method, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {method.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                    {method.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {method.title}
                </h3>
                <p className="text-xs font-semibold text-brand-600 mb-3">
                  {method.subtitle}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {method.desc}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                {method.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
