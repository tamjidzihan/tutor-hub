import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  BookOpen, 
  Calendar, 
  Users, 
  Send
} from 'lucide-react';
import type { TuitionJob } from '../../types';

interface JobCardProps {
  job: TuitionJob;
  onApply?: (job: TuitionJob) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Row: Job ID & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-navy-950 text-white font-mono text-xs font-bold tracking-wide">
              {job.job_id}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Posted {job.posted_at}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
            {job.curriculum}
          </span>
        </div>

        {/* Title */}
        <Link 
          to={`/job-board/${job.job_id}`}
          className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-3 block"
        >
          {job.title}
        </Link>

        {/* Location & Meta Row */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-slate-600 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{job.area}, {job.city}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{job.class_level}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>{job.days_per_week} Days / Week</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Pref: {job.preferred_tutor_gender} Tutor</span>
          </div>
        </div>

        {/* Subject Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.subjects.map((sub, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Salary & Action CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Offered Salary
          </span>
          <span className="text-lg font-black text-brand-600 font-heading">
            ৳{job.salary.toLocaleString()}
            <span className="text-xs font-normal text-slate-500"> / month</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/job-board/${job.job_id}`}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Details
          </Link>
          <button
            onClick={() => onApply ? onApply(job) : null}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            Apply Now
          </button>
        </div>
      </div>

    </div>
  );
};
