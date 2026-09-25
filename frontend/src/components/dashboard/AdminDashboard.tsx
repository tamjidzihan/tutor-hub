import React, { useEffect, useState } from 'react';
import { dashboardApi, type DashboardOverview } from '../../api/dashboard';

export const AdminDashboard: React.FC = () => {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        dashboardApi.getOverview().then(setOverview).catch(() => setError('Unable to load administrative data. Please try again.'));
    }, []);

    if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>;
    if (!overview) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading administrative data...</div>;

    const stats = overview.stats;
    const cards = [
        ['Total Users', stats.total_users], ['Tutors', stats.total_tutors], ['Parents', stats.total_parents], ['Students', stats.total_students],
        ['Tuition Jobs', stats.total_jobs], ['Active Jobs', stats.active_jobs], ['Applications', stats.total_applications], ['Requirements', stats.total_requirements],
    ];

    return (
        <div className="space-y-8">
            <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:p-8"><span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold">Admin Portal</span><h2 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">Platform Overview</h2><p className="mt-1 text-xs text-slate-300 sm:text-sm">All figures below are calculated from current database records.</p></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><span className="text-xs font-bold uppercase text-slate-500">{label}</span><h4 className="mt-1 font-heading text-2xl font-black text-slate-900">{Number(value).toLocaleString()}</h4></div>)}</div>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"><div className="border-b border-slate-100 p-5"><h3 className="text-base font-bold text-slate-900">Recent Tutor Profiles</h3></div><div className="divide-y divide-slate-100">{!overview.recent_tutors?.length ? <p className="p-8 text-center text-sm text-slate-500">No tutor profiles found.</p> : overview.recent_tutors.map((tutor) => <div key={tutor.id} className="flex items-center justify-between gap-4 p-5"><div><h4 className="text-sm font-bold text-slate-900">{`${tutor.user__first_name} ${tutor.user__last_name}`.trim() || tutor.tutor_id}</h4><p className="text-xs text-slate-500">{tutor.tutor_id} · {tutor.verification_status}</p></div><span className="text-xs font-bold text-slate-500">{new Date(tutor.created_at).toLocaleDateString()}</span></div>)}</div></section>
        </div>
    );
};
