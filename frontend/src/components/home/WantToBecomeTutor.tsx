import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const WantToBecomeTutor: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-brand-500/10 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              Tutor Recruitment Open
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading">
              Want to Become a <span className="text-brand-400">TUTOR</span>?
            </h2>
            
            <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
              Join Bangladesh's most reputable tutoring network. Teach subjects you love, choose your preferred locations and schedule, and earn an attractive income of <strong>৳15,000 - ৳45,000/month</strong> while building your leadership skills.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 bg-navy-900/60 p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Zero Commission on Signup</span>
              </div>
              <div className="flex items-center gap-2 bg-navy-900/60 p-2.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Verified Job Guarantee</span>
              </div>
              <div className="flex items-center gap-2 bg-navy-900/60 p-2.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Flexible Home & Online Hours</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
            <Link
              to="/become-a-tutor"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-lg hover:shadow-xl active:scale-98"
            >
              <span>Apply As A Tutor</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/job-board"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-sm transition-all"
            >
              Browse 2,450+ Live Tuition Jobs
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
