import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-xs font-bold">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">Last updated: March 2026</p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-card text-slate-700 text-sm leading-relaxed space-y-6">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              TutorHub (Tuition Terminal) collects personal identification information including Full Name, Mobile Number, Email Address, Present & Permanent Addresses, National ID (NID) / Birth Certificate Number, and verified academic transcripts from educational institutions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Data</h2>
            <p>
              Your data is strictly utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Verify educator background credentials with university student databases.</li>
              <li>Match parent/student academic requirements with qualified nearby tutors.</li>
              <li>Provide customer support, trial demo coordination, and security alerts.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Confidentiality & Safeguards</h2>
            <p>
              We enforce strict 256-bit SSL encryption and role-based data access controls. Personal phone numbers and home addresses are never published publicly on the open web and are shared exclusively with confirmed trial participants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Bangladesh Digital Security & ICT Act Compliance</h2>
            <p>
              All platform operations comply with the Information and Communication Technology (ICT) Act of Bangladesh and relevant consumer data privacy frameworks.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
