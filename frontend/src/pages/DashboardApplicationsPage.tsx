import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { applicationsApi } from '../api/applications';
import { requirementsApi } from '../api/requirements';
import type { JobApplication, TutorRequirement } from '../types';
import { ArrowRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export const DashboardApplicationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [requirements, setRequirements] = useState<TutorRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'TUTOR') {
        try {
          setApplications(await applicationsApi.getMyApplications());
        } catch {
          setError('Unable to load your applications. Please try again.');
        }
      } else {
        try {
          setRequirements(await requirementsApi.getMyRequirements());
        } catch {
          setError('Unable to load your requirements. Please try again.');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleWithdraw = async (appId: string) => {
    try {
      await applicationsApi.withdrawApplication(appId);
      setApplications(await applicationsApi.getMyApplications());
      showToast('Application withdrawn successfully.', 'success');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Unable to withdraw this application. Please try again.'), 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            {user?.role === 'TUTOR' ? 'My Job Applications' : 'My Posted Requirements'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'TUTOR'
              ? 'Track the approval and shortlist status of your applied tuition jobs.'
              : 'Manage submitted tuition requirements and review recommended tutor CVs.'}
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading your dashboard data...</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">{error}</div>
        ) : user?.role === 'TUTOR' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-xs">
                  No applications submitted yet. Browse the Job Board to apply!
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                          {app.job_id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${app.status === 'SHORTLISTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.status === 'WITHDRAWN'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                          {app.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{app.job_title}</h4>
                      <p className="text-xs text-slate-500">Applied on {app.applied_at} • Expected: ৳{app.expected_salary.toLocaleString()}/mo</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/job-board/${app.job_id}`}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View Job
                      </Link>
                      {app.status !== 'WITHDRAWN' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {requirements.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No tuition requirements yet.</div>}
              {requirements.map((req) => (
                <div key={req.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-navy-950 text-white font-mono text-xs font-bold">
                        {req.requirement_id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                        {req.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{req.student_name} ({req.class_level} — {req.curriculum})</h4>
                    <p className="text-xs text-slate-500">📍 {req.area}, {req.city} • Subjects: {req.subjects.join(', ')} • Budget: ৳{req.budget}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 shadow-xs"
                  >
                    View Matched Tutors
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
