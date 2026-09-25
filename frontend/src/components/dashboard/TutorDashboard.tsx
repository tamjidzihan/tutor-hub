import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Send, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, type DashboardOverview } from '../../api/dashboard';
import { jobsApi } from '../../api/jobs';
import type { TuitionJob } from '../../types';

export const TutorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [recommendedJobs, setRecommendedJobs] = useState<TuitionJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [overviewData, jobs] = await Promise.all([dashboardApi.getOverview(), jobsApi.getJobs()]);
                setOverview(overviewData);
                setRecommendedJobs(jobs.results.slice(0, 3));
            } catch {
                setError('Unable to load your dashboard. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading your dashboard...</div>;
    if (error || !overview) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>;

    const stats = overview.stats;
    const applications = overview.recent_applications || [];
    const profileCompletion = Number(stats.profile_completion || 0);

    return (
        <div className="space-y-8">
            <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:p-8">
                <span className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-bold">Tutor Portal</span>
                <h2 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">Welcome back, {user?.first_name}!</h2>
                <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">Your dashboard reflects your current applications and tutor profile data.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
                <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div><div className="flex items-center gap-2"><h3 className="text-base font-bold text-slate-900">Profile Completion</h3><span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-black text-brand-600">{profileCompletion}%</span></div><p className="mt-0.5 text-xs text-slate-500">This percentage comes from your saved tutor profile.</p></div>
                    <Link to="/dashboard/profile" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100">Update Profile <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${profileCompletion}%` }} /></div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Total Applied" value={stats.total_applications} icon={<Send className="h-4 w-4 text-brand-500" />} />
                <Metric label="Pending" value={stats.pending_applications} icon={<Send className="h-4 w-4 text-amber-500" />} />
                <Metric label="Shortlisted" value={stats.shortlisted_applications} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
                <Metric label="Tutor Rating" value={stats.rating == null ? 'Not rated' : `${stats.rating} / 5`} icon={<Star className="h-4 w-4 text-amber-500" />} />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-slate-100 p-5"><h3 className="text-base font-bold text-slate-900">Recent Job Applications</h3><Link to="/job-board" className="text-xs font-bold text-brand-600">Browse Jobs</Link></div>
                <div className="divide-y divide-slate-100">
                    {applications.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No applications yet. Browse available jobs to get started.</p> : applications.map((app) => <div key={app.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-slate-500">{app.job_id}</span><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{app.status}</span></div><h4 className="text-sm font-bold text-slate-900">{app.job_title}</h4><p className="text-xs text-slate-500">Applied on {app.applied_at}</p></div><Link to={`/job-board/${app.job_id}`} className="text-xs font-bold text-brand-600">View Job</Link></div>)}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card"><div className="mb-4 flex items-center justify-between"><h3 className="text-base font-bold text-slate-900">Available Tuition Jobs</h3><Link to="/job-board" className="text-xs font-bold text-brand-600">View All</Link></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3">{recommendedJobs.length === 0 ? <p className="text-sm text-slate-500">No available tuition jobs right now.</p> : recommendedJobs.map((job) => <div key={job.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"><span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{job.curriculum}</span><h4 className="mt-1 line-clamp-2 text-xs font-bold text-slate-900">{job.title}</h4><p className="mt-2 text-[11px] text-slate-500">{job.area}, {job.city}</p><div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3"><span className="text-xs font-bold text-slate-900">৳{job.salary.toLocaleString()}</span><Link to={`/job-board/${job.job_id}`} className="rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white">View Job</Link></div></div>)}</div></section>
        </div>
    );
};

const Metric: React.FC<{ label: string; value: string | number | null; icon: React.ReactNode }> = ({ label, value, icon }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><div className="mb-2 flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase tracking-wider">{label}</span>{icon}</div><h4 className="font-heading text-2xl font-black text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</h4></div>;
