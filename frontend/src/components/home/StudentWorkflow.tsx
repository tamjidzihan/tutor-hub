import React from 'react';
import { UserPlus, ClipboardList, FileCheck2, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentWorkflow: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Submit Requirements',
      desc: 'Specify your child’s class, subjects, location, days, budget, and preferred tutor gender.',
      icon: <ClipboardList className="w-6 h-6 text-brand-600" />
    },
    {
      number: '02',
      title: 'Get Verified CVs',
      desc: 'Our matching system recommends top university tutors (BUET, DMC, DU, IBA) within 2-4 hours.',
      icon: <FileCheck2 className="w-6 h-6 text-brand-600" />
    },
    {
      number: '03',
      title: 'Take Free Demo Class',
      desc: 'Evaluate the tutor’s teaching style, communication, and subject clarity through a free trial.',
      icon: <UserPlus className="w-6 h-6 text-brand-600" />
    },
    {
      number: '04',
      title: 'Confirm & Start Tutoring',
      desc: 'Finalize terms, confirm schedule, and enjoy structured, regular academic progression.',
      icon: <UserCheck className="w-6 h-6 text-brand-600" />
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full mb-2">
            For Parents & Students
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            How Parents & Students Connect With Us
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            A hassle-free 4-step process designed to match your child with Bangladesh's most qualified instructors.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-slate-200 font-heading">
                  {step.number}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center text-xs font-bold text-brand-600">
                <span>Step {step.number}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/appoint-a-tutor"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            Post Your Requirement (Free)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
