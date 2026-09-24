import React from 'react';
import { MultiStepTutorRegistration } from '../components/tutor/MultiStepTutorRegistration';
import { GraduationCap, ShieldCheck, DollarSign, Clock, Award } from 'lucide-react';

export const BecomeATutor: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            Join 48,000+ Verified Instructors
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading">
            Apply As A Verified Tutor on TutorHub
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Teach students in your preferred neighborhood, set your expected fees, and build an exceptional academic reputation across Bangladesh.
          </p>
        </div>

        {/* Perks Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle text-center">
            <DollarSign className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">High Earnings</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">৳15K - ৳45K / mo average</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle text-center">
            <Clock className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Flexible Timings</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Home & Online choices</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle text-center">
            <ShieldCheck className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Verified Badge</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">NID & University Checked</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle text-center">
            <Award className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Zero Upfront Fee</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">100% Free registration</p>
          </div>
        </div>

        {/* Multi-step Registration Component */}
        <MultiStepTutorRegistration />

      </div>
    </div>
  );
};
