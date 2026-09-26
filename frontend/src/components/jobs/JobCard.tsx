import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  BookOpen,
  Calendar,
  Users,
  Send,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { TuitionJob } from '../../types';

interface JobCardProps {
  job: TuitionJob;
  onApply?: (job: TuitionJob) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">

      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-brand-400 via-brand-500 to-brand-600 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Subtle top-right glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-100/50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5 sm:p-6 flex flex-col flex-1">

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
              {job.job_id}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="w-3 h-3" />
              {job.posted_at}
            </span>
          </div>

          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-linear-to-r from-brand-50 to-brand-100 text-brand-700 border border-brand-200/70">
            {job.curriculum}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/job-board/${job.job_id}`}
          className="block text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-4"
        >
          {job.title}
        </Link>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <MetaItem icon={<MapPin className="w-3.5 h-3.5" />} label={`${job.area}, ${job.city}`} />
          <MetaItem icon={<BookOpen className="w-3.5 h-3.5" />} label={job.class_level} />
          <MetaItem icon={<Calendar className="w-3.5 h-3.5" />} label={`${job.days_per_week} Days / Week`} />
          <MetaItem icon={<Users className="w-3.5 h-3.5" />} label={`Pref: ${job.preferred_tutor_gender}`} />
        </div>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.subjects.map((sub, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200/60 transition-colors"
            >
              {sub}
            </span>
          ))}
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Footer: Salary & CTA */}
        <div className="pt-4 border-t border-dashed border-slate-200 flex items-end justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Offered Salary
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-brand-600 font-heading tracking-tight">
                ৳{job.salary.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-slate-400">/month</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/job-board/${job.job_id}`}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Details
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => onApply?.(job)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold shadow-sm shadow-brand-500/20 hover:shadow-brand-500/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Small helper for meta rows --- */
const MetaItem: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 min-w-0">
    <span className="text-brand-500 shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </div>
);