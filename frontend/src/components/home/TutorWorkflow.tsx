import React from 'react';
import { UserCheck, Edit3, Send, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TutorWorkflow: React.FC = () => {
  const tutorSteps = [
    {
      number: '01',
      title: 'Create Account',
      desc: 'Sign up in under 60 seconds with your email, phone number, and basic academic identity.',
      icon: <UserCheck className="w-6 h-6 text-brand-600" />
    },
    {
      number: '02',
      title: 'Complete Profile',
      desc: 'Upload your University ID, academic records, preferred teaching locations, and expected salary.',
      icon: <Edit3 className="w-6 h-6 text-brand-600" />
    },
    {
      number: '03',
      title: 'Apply for Jobs',
      desc: 'Browse hundreds of live tuition jobs matching your location and submit applications with custom cover notes.',
      icon: <Send className="w-6 h-6 text-brand-600" />
    },
    {
      number: '04',
      title: 'Start Tutoring & Earn',
      desc: 'Deliver great trial classes, lock in monthly tuition, and get guaranteed on-time honorariums.',
      icon: <DollarSign className="w-6 h-6 text-brand-600" />
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full mb-2">
            For Tutors & Instructors
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            The Ways Tutors Can Connect With Us
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Turn your academic excellence into respected, flexible income in 4 straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tutorSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
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
                <span>Phase {step.number}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/become-a-tutor"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            Register as a Tutor
            <ArrowRight className="w-4 h-4 text-brand-400" />
          </Link>
        </div>

      </div>
    </section>
  );
};
