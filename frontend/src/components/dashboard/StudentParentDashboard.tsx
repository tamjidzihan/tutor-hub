import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, type DashboardOverview } from '../../api/dashboard';
import { jobsApi } from '../../api/jobs';
import type { TuitionJob } from '../../types';

import { DashboardMessagesCard } from './DashboardMessagesCard';

export const StudentParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [postedJobs, setPostedJobs] = useState<TuitionJob[]>([]);
    const [error, setError] = useState('');

    const loadData = async () => {
        try {
            const [overviewData, jobsData] = await Promise.all([dashboardApi.getOverview(), jobsApi.getJobs({})]);
            setOverview(overviewData);
            const userJobs = jobsData.results.filter((j: TuitionJob) => j.student === user?.id);
            setPostedJobs(userJobs);
        } catch {
            setError('Unable to load your requirements. Please try again.');
        }
    };

    useEffect(() => { loadData(); }, []);

    if (error && !overview) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>;
    if (!overview) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading your requirements...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8"><div><span className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-bold">Student Dashboard</span><h2 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">Welcome, {user?.first_name} {user?.last_name}!</h2><p className="mt-1 max-w-lg text-xs text-slate-300 sm:text-sm">Manage your academic requirements, direct messages, and tutor matches.</p></div><Link to="/find-tutor" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"><Plus className="h-4 w-4" />Find a Tutor</Link></div>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3"><Metric label="Posted Jobs" value={postedJobs.length} /><Metric label="Applications Received" value={overview?.stats?.applications_received || 0} /><Metric label="Live Jobs" value={overview?.stats?.liveTuitionJobs || 0} /></div>

      {/* Messages & Conversations Card */}
      <DashboardMessagesCard />

      <section className="space-y-6"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">My Posted Jobs</h3><span className="text-xs font-bold text-slate-500">{postedJobs.length} posted</span></div>{postedJobs.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No tuition jobs posted yet. Create one from the Job Board.</div> : postedJobs.map((job) => <div key={job.id} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card"><div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><span className="rounded-md bg-navy-950 px-2.5 py-1 font-mono text-xs font-bold text-white">{job.job_id}</span><h4 className="mt-1 text-base font-bold text-slate-900">{job.title}</h4></div><span className="font-heading text-lg font-black text-slate-900">৳{job.salary.toLocaleString()} / mo</span></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 sm:grid-cols-4"><Info label="Location" value={`${job.area}, ${job.city}`} /><Info label="Subjects" value={job.subjects?.join(', ') || '-'} /><Info label="Class" value={job.class_level} /><Info label="Applicants" value={String(job.applicants_count || 0)} /></div></div>)}</section>
    </div>
    );
};

const Metric: React.FC<{ label: string; value: unknown }> = ({ label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><span className="text-xs font-bold uppercase text-slate-500">{label}</span><h4 className="mt-1 font-heading text-2xl font-black text-slate-900">{typeof value === 'number' ? value.toLocaleString() : String(value ?? 0)}</h4></div>;
const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><span className="block text-slate-400">{label}</span><strong className="text-slate-800">{value || 'Not provided'}</strong></div>;
