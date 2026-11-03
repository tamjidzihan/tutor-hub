import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, MapPin, UserRound } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { applicationsApi } from '../api/applications';
import { jobsApi } from '../api/jobs';
import type { JobApplication, TuitionJob } from '../types';

type ApplicationFilter = 'ALL' | 'NEW' | 'SEEN';

export const DashboardJobApplicationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { jobId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<TuitionJob | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filter, setFilter] = useState<ApplicationFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const targetApplicationId = searchParams.get('application_id');

  const loadData = useCallback(async () => {
    try {
      const [jobData, applicationData] = await Promise.all([
        jobsApi.getJobById(jobId),
        applicationsApi.getApplicationsForJob(jobId),
      ]);
      if (!jobData) {
        setError('This tuition job could not be found.');
        return;
      }
      setJob(jobData);
      setApplications(applicationData);
    } catch {
      setError('Unable to load applications for this job. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT') void loadData();
  }, [isAuthenticated, user, loadData]);

  const markSeen = useCallback(async (applicationId: string) => {
    try {
      await applicationsApi.markSeen(applicationId);
      setApplications((current) => current.map((application) =>
        application.id === applicationId
          ? { ...application, seen_by_student: true }
          : application
      ));
    } catch {
      setActionError('Unable to update the application’s seen status.');
    }
  }, []);

  useEffect(() => {
    if (!targetApplicationId) return;
    const target = applications.find((application) => application.id === targetApplicationId);
    if (!target) return;

    document.getElementById(`application-${targetApplicationId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

  }, [applications, targetApplicationId]);

  const selectTutor = async (application: JobApplication) => {
    if (!window.confirm(`Select ${application.tutor_name || 'this tutor'} for this tuition job?`)) return;
    try {
      setActionError('');
      await applicationsApi.selectTutor(application.id);
      await loadData();
    } catch {
      setActionError('Unable to select this tutor. Please try again.');
    }
  };

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'STUDENT') return <Navigate to="/dashboard/jobs" replace />;

  const newCount = applications.filter((application) => !application.seen_by_student).length;
  const visibleApplications = applications.filter((application) => {
    if (filter === 'NEW') return !application.seen_by_student;
    if (filter === 'SEEN') return application.seen_by_student;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          to="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          My Posted Jobs
        </Link>

        <section className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-300">Job Applicants</p>
              <h2 className="text-2xl font-black font-heading">{job?.title || 'Applications'}</h2>
              {job && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300">
                  <MapPin className="h-4 w-4" />
                  {job.area}, {job.city}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Total</span>
                <span className="text-xl font-black">{applications.length}</span>
              </div>
              <div className="rounded-2xl border border-brand-500/30 bg-brand-500/15 px-4 py-3">
                <span className="block text-[10px] font-bold uppercase text-brand-200">New</span>
                <span className="text-xl font-black text-brand-300">{newCount}</span>
              </div>
            </div>
          </div>
        </section>

        {actionError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-2" aria-label="Filter applications">
          {(['ALL', 'NEW', 'SEEN'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                filter === value
                  ? 'bg-navy-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {value === 'ALL' ? `All (${applications.length})` : value === 'NEW' ? `New (${newCount})` : `Seen (${applications.length - newCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading applications…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        ) : visibleApplications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <UserRound className="mx-auto mb-3 h-9 w-9 text-slate-300" />
            <h3 className="font-bold text-slate-800">
              {applications.length === 0 ? 'No tutors have applied yet' : `No ${filter.toLowerCase()} applications`}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Applications for this job will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleApplications.map((application) => (
              <article
                key={application.id}
                id={`application-${application.id}`}
                className={`scroll-mt-6 rounded-2xl border p-5 shadow-card transition-colors ${
                  application.seen_by_student
                    ? 'border-slate-200 bg-white'
                    : 'border-brand-300 bg-brand-50/60 ring-1 ring-brand-100'
                }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                      {application.tutor_profile_photo || application.tutor_details?.profile_image ? (
                        <img
                          src={application.tutor_profile_photo || application.tutor_details?.profile_image}
                          alt={application.tutor_name || 'Tutor'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={application.tutor_tutor_id ? `/hub/tutor-details/${application.tutor_tutor_id}` : '/find-tutor'}
                        onClick={() => {
                          if (!application.seen_by_student) void markSeen(application.id);
                        }}
                        className="block truncate text-base font-bold text-slate-900 hover:text-brand-700"
                      >
                        {application.tutor_name || 'Tutor'}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Applied {application.applied_at} · Expected ৳{application.expected_salary.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      application.seen_by_student
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-brand-100 text-brand-800'
                    }`}>
                      {application.seen_by_student ? 'Seen' : 'New application'}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                      {application.status}
                    </span>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white/80 p-4 text-sm leading-6 text-slate-700">
                  {application.cover_message}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={application.tutor_tutor_id ? `/hub/tutor-details/${application.tutor_tutor_id}` : '/find-tutor'}
                      onClick={() => {
                        if (!application.seen_by_student) void markSeen(application.id);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      View full profile
                    </Link>
                    {!application.seen_by_student && (
                      <button
                        type="button"
                        onClick={() => void markSeen(application.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark as seen
                      </button>
                    )}
                    {application.seen_by_student && (
                      <span className="inline-flex items-center gap-1.5 px-2 text-xs text-slate-500">
                        <CheckCheck className="h-3.5 w-3.5" />
                        Reviewed
                      </span>
                    )}
                  </div>
                  {application.status !== 'SELECTED' && job?.status !== 'APPOINTED' && (
                    <button
                      type="button"
                      onClick={() => void selectTutor(application)}
                      className="cursor-pointer rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-600"
                    >
                      Select tutor
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
