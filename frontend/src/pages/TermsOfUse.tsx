import React from 'react';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-xs font-bold">
            Terms & Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Effective Date: March 2026</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-card text-slate-700 text-sm leading-relaxed space-y-6">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing TutorHub (Tuition Terminal), registering as an educator, or posting a tuition requirement as a guardian, you agree to abide by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. Tutor Obligations & Code of Conduct</h2>
            <p>
              Registered tutors must provide authentic academic credentials, maintain professional conduct, arrive punctually at confirmed tuition venues, and safeguard the educational well-being of the student.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Parent & Student Responsibilities</h2>
            <p>
              Parents agree to provide a respectful, safe study environment for in-person home tutoring and ensure timely payment of mutually agreed monthly tuition fees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Free Trial & Replacement Policy</h2>
            <p>
              Guardians are entitled to an initial demo class. If unsatisfied, TutorHub coordinates an immediate verified replacement without any extra platform service fee.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
