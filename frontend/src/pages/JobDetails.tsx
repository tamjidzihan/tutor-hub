import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import type { TuitionJob } from '../types';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import { 
  ShieldCheck, 
  ArrowLeft,
  Send
} from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<TuitionJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      setIsLoading(true);
      try {
        const found = await jobsApi.getJobById(jobId);
        setJob(found);
      } finally {
        setIsLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={1} type="card" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Tuition Job Not Found"
          description={`We could not find any active tuition posting with identifier "${jobId}".`}
          actionText="Back to Job Board"
          onAction={() => navigate('/job-board')}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/job-board"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all tuition jobs
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-md bg-navy-950 text-white font-mono text-xs font-bold tracking-wider">
                  {job.job_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                  {job.curriculum}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Posted {job.posted_at}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                {job.title}
              </h1>
            </div>

            <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Offered Honorarium
              </span>
              <span className="text-2xl font-black text-brand-600 font-heading">
                ৳{job.salary.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / month</span>
              </span>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">City & Area:</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{job.area}, {job.city}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Class Level:</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{job.class_level}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Tuition Format:</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{job.tuition_type}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Preferred Tutor:</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{job.preferred_tutor_gender} Tutor</strong>
            </div>
          </div>

          {/* Detailed Job Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Subjects to Teach
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 font-semibold text-xs"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Tuition Description & Context
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-white">
                {job.description}
              </p>
            </div>

            {job.additional_requirements && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Special Requirements
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {job.additional_requirements}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Weekly Schedule</span>
                <p className="text-sm font-bold text-slate-900">{job.days_per_week} Days / Week</p>
                <p className="text-xs text-slate-500">{job.preferred_time || 'Negotiable Timing'}</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Application Stats</span>
                <p className="text-sm font-bold text-slate-900">{job.applicants_count} Tutors Applied</p>
                <p className="text-xs text-emerald-600 font-semibold">Currently Reviewing Profiles</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Safety Guaranteed. Verified tutor matching process.</span>
            </div>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              Apply for this Tuition
            </button>
          </div>

        </div>

      </div>

      {isApplyModalOpen && (
        <ApplyJobModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={() => {
            if (job) job.applicants_count += 1;
          }}
        />
      )}
    </div>
  );
};
