import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  DollarSign,
  Send,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import type { JobApplication, TuitionJob } from '../../types';

export const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<TuitionJob[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [apps, jobsRes] = await Promise.all([
          applicationsApi.getMyApplications(),
          jobsApi.getJobs({ city: 'Dhaka' })
        ]);
        setApplications(apps);
        setRecommendedJobs(jobsRes.results.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    loadDashboardData();
  }, []);

  const profileCompletion = 95; // Section 32: Profile Completion Progress

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="px-2.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-md">
            Verified Tutor Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            You have <strong>{applications.length} active applications</strong>. 12 new tuition jobs were posted in your preferred location (Mirpur, Dhaka) today.
          </p>
        </div>
      </div>

      {/* Profile Completion Bar (Section 32) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Profile Completion</h3>
              <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                {profileCompletion}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add your recent degree certificate to reach 100% and rank at the top of guardian search results.
            </p>
          </div>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
          >
            Update Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applied</span>
            <Send className="w-4 h-4 text-brand-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 font-heading">{applications.length}</h4>
          <p className="text-xs text-slate-400 mt-1">Applications in review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-2xl font-black text-emerald-600 font-heading">
            {applications.filter(a => a.status === 'SHORTLISTED').length}
          </h4>
          <p className="text-xs text-slate-400 mt-1">Demo class requested</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tutor Rating</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 font-heading">4.9 / 5.0</h4>
          <p className="text-xs text-slate-400 mt-1">38 Verified Guardian Reviews</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Monthly</span>
            <DollarSign className="w-4 h-4 text-brand-600" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 font-heading">৳28,000</h4>
          <p className="text-xs text-slate-400 mt-1">Active tuitions revenue</p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Job Applications</h3>
          <Link to="/job-board" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            Browse More Jobs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.map((app) => (
            <div key={app.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{app.job_reference}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${app.status === 'SHORTLISTED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {app.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{app.job_title}</h4>
                <p className="text-xs text-slate-500">Applied on {app.applied_at} • Expected: ৳{app.expected_salary.toLocaleString()}</p>
              </div>

              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                Profile Shared with Guardian
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Recommended Jobs For You</h3>
          <Link to="/job-board" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All ({recommendedJobs.length}+)
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedJobs.map((job) => (
            <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{job.curriculum}</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{job.title}</h4>
                <p className="text-[11px] text-slate-500 mt-2">📍 {job.area}, {job.city}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">৳{job.salary.toLocaleString()}</span>
                <Link
                  to={`/job-board/${job.job_id}`}
                  className="px-2.5 py-1 bg-brand-500 text-white text-[11px] font-bold rounded-md"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
