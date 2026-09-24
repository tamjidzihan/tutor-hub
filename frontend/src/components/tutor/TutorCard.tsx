import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import type { Tutor } from '../../types';

interface TutorCardProps {
  tutor: Tutor;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Tutor Header Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={tutor.profile_photo}
              alt={tutor.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-brand-400 transition-all"
            />
            {tutor.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white p-1 rounded-full shadow-md" title="Verified Tutor">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Link
                to={`/hub/tutor-details/${tutor.tutor_id}`}
                className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate block"
              >
                {tutor.name}
              </Link>
              <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                {tutor.tutor_id}
              </span>
            </div>

            <p className="text-xs font-semibold text-brand-700 truncate mt-0.5">
              {tutor.university}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {tutor.department}
            </p>

            {/* Rating Bar */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{tutor.rating.toFixed(1)}</span>
              <span className="text-[11px] text-slate-400">({tutor.total_reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Location & Experience Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 py-3 border-y border-slate-100 mb-3 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{tutor.area}, {tutor.city}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>{tutor.experience_years}+ Yrs Experience</span>
          </div>
        </div>

        {/* Subjects Badges */}
        <div className="space-y-1.5 mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Teaching Subjects:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 4).map((sub, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                {sub}
              </span>
            ))}
            {tutor.subjects.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold">
                +{tutor.subjects.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Expected Salary & CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Expected Salary
          </span>
          <span className="text-base font-black text-slate-900 font-heading">
            ৳{tutor.expected_salary.toLocaleString()}
            <span className="text-[11px] font-normal text-slate-500"> / mo</span>
          </span>
        </div>

        <Link
          to={`/hub/tutor-details/${tutor.tutor_id}`}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
