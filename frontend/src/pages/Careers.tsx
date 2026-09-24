import React, { useState, useEffect } from 'react';
import { contentApi } from '../api/content';
import type { Career } from '../types';
import { Briefcase, MapPin, Clock, Mail, CheckCircle2 } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/FeedbackStates';

export const Careers: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await contentApi.getCareers();
        setCareers(data);
      } catch (err) {
        console.error('Failed to load careers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            We Are Hiring!
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            Build the Future of EdTech with TutorHub
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Join our high-impact engineering, operations, and academic team in Mirpur DOHS, Dhaka.
          </p>
        </div>

        {/* Positions List */}
        {loading ? (
          <LoadingSkeleton count={3} type="row" />
        ) : (
          <div className="space-y-6">
            {careers.map((job: Career) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                      {job.department} • {job.type || 'Full-time'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{job.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-400 block">Experience</span>
                    <span className="text-sm font-black text-brand-600">{job.experience || '1+ Year'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {job.location || 'Dhaka, Bangladesh'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    Apply before {job.deadline || 'Open until filled'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Key Requirements:</h4>
                    <div className="space-y-1">
                      {job.requirements.map((req: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Send your CV and GitHub/Portfolio to career@tutorhub.com.bd</span>
                  <a
                    href="mailto:career@tutorhub.com.bd"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Apply for Position
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
