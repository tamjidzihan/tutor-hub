import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Send,
  Star,
  Clock,
  GraduationCap,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, type DashboardOverview } from '../../api/dashboard';

export const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load Dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const overviewData = await dashboardApi.getOverview();
        setOverview(overviewData);
      } catch {
        setError('Unable to load your dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center text-sm font-medium text-slate-500 shadow-card border border-slate-200/80">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading your live dashboard data...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        {error || 'Unable to connect to the dashboard API.'}
      </div>
    );
  }

  const stats = overview.stats;
  const applications = overview.recent_applications || [];
  const profileCompletion = Number(stats.profile_completion || 0);
  const tutorId = stats.tutor_id as string | undefined;
  const isVerified = Boolean(stats.is_verified);

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Banner with Real Profile Data */}
      <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
              Tutor Portal
            </span>
            {tutorId && (
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-mono font-bold text-brand-300 border border-slate-700">
                ID: {tutorId}
              </span>
            )}
            {isVerified ? (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Tutor
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold">
                Verification Pending
              </span>
            )}
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user?.first_name} {user?.last_name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your live tuition applications, track shortlist statuses, and update your academic tutoring credentials.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <Link
            to="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md"
          >
            <GraduationCap className="w-4 h-4" />
            Find Tuition Jobs
          </Link>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
        <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Profile Completion Score</h3>
              <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-black text-brand-600">
                {profileCompletion}%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Profiles with complete academic records, subjects, and ID verification receive significantly more job inquiries.
            </p>
          </div>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors shrink-0"
          >
            Complete Profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>

      {/* Database Key Stats Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total Applied"
          value={stats.total_applications}
          icon={<Send className="h-4 w-4 text-brand-500" />}
          subtext="Total jobs you applied to"
        />
        <Metric
          label="Pending Review"
          value={stats.pending_applications}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          subtext="Awaiting guardian review"
        />
        <Metric
          label="Shortlisted / Selected"
          value={Number(stats.shortlisted_applications || 0) + Number(stats.selected_applications || 0)}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          subtext="Candidate shortlisted"
        />
        <Metric
          label="Tutor Rating"
          value={stats.rating == null ? 'Not rated' : `${stats.rating} ★`}
          icon={<Star className="h-4 w-4 text-amber-500" />}
          subtext={stats.total_reviews ? `${stats.total_reviews} total reviews` : 'Based on completed tuitions'}
        />
      </div>

      {/* Quick Access Card to Find Tuition Jobs */}
      <div className="rounded-3xl border border-brand-200/80 bg-gradient-to-br from-brand-50/60 via-white to-brand-50/30 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              Looking for new tuition opportunities?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Use the <strong>Find Tuition Jobs</strong> section on the sidebar menu to search real-time guardian requests by subject, city, and curriculum.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shrink-0"
        >
          <span>Open Find Tuition Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Applications from Database */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Recent Job Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live status updates from parent and student job reviews.</p>
          </div>
          <Link to="/dashboard/applications" className="text-xs font-bold text-brand-600 hover:underline">
            View All ({applications.length})
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Send className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No applications submitted yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore live tuition posts in the Find Tuition Jobs section and apply to start receiving student matches.
              </p>
              <div className="pt-2">
                <Link
                  to="/dashboard/jobs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Find Tuition Jobs
                </Link>
              </div>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {app.job_id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        app.status === 'SHORTLISTED' || app.status === 'SELECTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{app.job_title}</h4>
                  <p className="text-xs text-slate-500">
                    Applied on {app.applied_at} • Expected: ৳{app.expected_salary.toLocaleString()}
                  </p>
                </div>

                <Link
                  to={`/job-board/${app.job_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-lg self-start sm:self-auto"
                >
                  <span>Job Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};

const Metric: React.FC<{
  label: string;
  value: string | number | null;
  icon: React.ReactNode;
  subtext?: string;
}> = ({ label, value, icon, subtext }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-1">
    <div className="flex items-center justify-between text-slate-500">
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <h4 className="font-heading text-2xl font-black text-slate-900">
      {typeof value === 'number' ? value.toLocaleString() : value ?? '0'}
    </h4>
    {subtext && <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>}
  </div>
);
