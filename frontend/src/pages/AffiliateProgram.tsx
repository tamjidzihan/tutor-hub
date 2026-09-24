import React, { useState } from 'react';
import { Gift, DollarSign, Share2, Award, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const AffiliateProgram: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const affiliateCode = 'TUTORHUB-PARTNER-2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://tutorhub.com.bd/?ref=${affiliateCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <Gift className="w-3.5 h-3.5" />
              TutorHub Affiliate Program
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
              Partner With Us & Earn <span className="text-brand-400">Up to ৳50,000</span> Every Month
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join hundreds of campus ambassadors, social media creators, and education enthusiasts. Recommend tutors and guardians to TutorHub and earn lucrative commissions.
            </p>
          </div>
        </div>

        {/* 3 Step How it Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">1. Get Your Unique Link</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register as an affiliate partner to receive personalized referral links and marketing media kits.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">2. Refer Tutors & Parents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Share your link across university groups, Facebook communities, WhatsApp, and educational channels.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">3. Guaranteed Payouts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive automatic weekly payouts directly into your bKash, Nagad, or Bank Account on every successful match.
            </p>
          </div>
        </div>

        {/* Demo Affiliate Link Card & Signup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Link Box */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Sample Partner Referral Link
            </h3>
            <p className="text-xs text-slate-600">
              Once approved, your referral tracking link attaches cookies for 90 days. Any tutor or student who signs up within 90 days will be attributed to your earnings.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-slate-700 truncate">
                https://tutorhub.com.bd/?ref={affiliateCode}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shrink-0 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Breakdown</h4>
              <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                <span>Verified Tutor Signup</span>
                <span className="text-brand-600 font-bold">৳500 – ৳1,200</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                <span>Student Tuition Confirmed</span>
                <span className="text-brand-600 font-bold">৳800 – ৳2,000</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Our growth team will review your partner application and email your affiliate credentials within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Apply for Affiliate Program
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="Tamzid Ahmed" required />
                  <Input label="Phone (bKash Number)" placeholder="01XXXXXXXXX" required />
                </div>

                <Input label="Email Address" type="email" placeholder="you@example.com" required />
                <Input label="University / Organization / Social Profile" placeholder="e.g. BUET / Facebook Page / Community Lead" required />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Submit Partner Application
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
