import React from 'react';
import { Smartphone, Star } from 'lucide-react';

export const AppDownload: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-8 sm:p-12 text-white relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile App Available
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading">
                Take TutorHub in Your Pocket. <span className="text-brand-400">Download the App</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Track tuition applications, receive instant alerts when matching jobs are posted in your neighborhood, chat securely, and manage schedules on the go.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 0 1-1.61-.41 1.996 1.996 0 0 1-.5-1.476V3.7a1.996 1.996 0 0 1 .5-1.476 1.996 1.996 0 0 1 1.609-.41zm11.604 11.607l2.25 2.25-10.428 6.02 8.178-8.27zm0-2.842L7.035 2.302l10.428 6.02-2.25 2.257zm1.42 1.421l3.526 2.036c.96.554.96 1.458 0 2.012l-3.526 2.036-2.146-2.146 2.146-1.938z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold text-slate-500 leading-none">Get it on</p>
                    <p className="text-sm font-extrabold text-slate-900 leading-tight">Google Play</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:bg-slate-700 transition-all shadow-md active:scale-95"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-.99 1.73-.85 2.76 1.01.08 1.96-.51 2.58-1.26z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Download on</p>
                    <p className="text-sm font-extrabold text-white leading-tight">App Store</p>
                  </div>
                </button>
              </div>

              <div className="flex items-center space-x-4 pt-2 text-xs text-slate-400">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span><strong>4.8 / 5.0</strong> (12,000+ Reviews)</span>
              </div>
            </div>

            {/* QR Code Box */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-6 bg-navy-900/90 p-6 rounded-2xl border border-slate-800">
              <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0">
                {/* SVG Mock QR Code */}
                <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <path d="M10 10H38V38H10V10ZM16 16V32H32V16H16ZM62 10H90V38H62V10ZM68 16V32H84V16H68ZM10 62H38V90H10V62ZM16 68V84H32V68H16ZM46 10H54V26H46V10ZM46 34H54V42H46V34ZM46 58H54V66H46V58ZM46 74H54V90H46V74ZM62 46H70V54H62V46ZM78 46H86V54H78V46ZM62 62H70V70H62V62ZM78 62H90V70H78V62ZM70 78H78V86H70V78ZM86 78H90V90H86V78Z" fill="#0F172A" />
                  <rect x="22" y="22" width="4" height="4" fill="#86C240" />
                  <rect x="74" y="22" width="4" height="4" fill="#86C240" />
                  <rect x="22" y="74" width="4" height="4" fill="#86C240" />
                </svg>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Scan to Install
                </p>
                <h4 className="text-base font-bold text-white">
                  Instant Mobile Access
                </h4>
                <p className="text-xs text-slate-400">
                  Point your phone camera to download instantly for Android & iOS.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
