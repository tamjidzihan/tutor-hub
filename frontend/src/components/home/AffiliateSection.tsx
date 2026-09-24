import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight, DollarSign, Share2, Award, CheckCircle2 } from 'lucide-react';

export const AffiliateSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-brand-900 via-navy-900 to-navy-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Gift className="w-3.5 h-3.5" />
              TutorHub Affiliate Partner Program
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-heading text-white">
              Earn Lifetime Commission with Our <span className="text-brand-400">Affiliate Program</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Are you a campus ambassador, educational blogger, content creator, or university student leader? Refer tutors or parents to TutorHub and earn handsome commissions per successful match.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-navy-900/80 p-4 rounded-xl border border-slate-800">
                <Share2 className="w-5 h-5 text-brand-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">1. Share Link</h4>
                <p className="text-xs text-slate-400">Get unique affiliate invite link & banner assets.</p>
              </div>

              <div className="bg-navy-900/80 p-4 rounded-xl border border-slate-800">
                <Award className="w-5 h-5 text-brand-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">2. Referral Signs Up</h4>
                <p className="text-xs text-slate-400">Tutors or parents post requirements via your link.</p>
              </div>

              <div className="bg-navy-900/80 p-4 rounded-xl border border-slate-800">
                <DollarSign className="w-5 h-5 text-brand-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">3. Instant Payout</h4>
                <p className="text-xs text-slate-400">Direct bKash / bank transfer on confirmed tuitions.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/affiliate-program"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg transition-all active:scale-98"
              >
                <span>Join Affiliate Program Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-navy-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Partner Monthly Income</p>
                  <p className="text-3xl font-black text-brand-400 font-heading">৳48,500+</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="py-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Commission Per Confirmed Tutor</span>
                  <span className="text-white font-bold">৳500 – ৳1,500</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Commission Per Student Tuition</span>
                  <span className="text-white font-bold">৳800 – ৳2,000</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Payout Cycle</span>
                  <span className="text-brand-400 font-bold">Weekly via bKash / Nagad</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Transparent real-time dashboard analytics</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
