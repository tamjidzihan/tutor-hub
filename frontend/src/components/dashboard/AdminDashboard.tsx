import React, { useEffect, useState } from 'react';
import { CheckCircle2, Search, UserCheck, Users, Briefcase, ClipboardList } from 'lucide-react';
import { dashboardApi, type AdminRecord, type AdminResource, type AdminResourceResponse, type DashboardOverview } from '../../api/dashboard';
import { Pagination } from '../common/Pagination';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';

const resources: Array<{ key: AdminResource; label: string; icon: React.ReactNode }> = [
    { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { key: 'tutors', label: 'Tutors', icon: <UserCheck className="h-4 w-4" /> },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'requirements', label: 'Requirements', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'applications', label: 'Applications', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const statusOptions: Record<AdminResource, string[]> = {
    users: [],
    tutors: ['PENDING', 'VERIFIED', 'REJECTED'],
    jobs: ['AVAILABLE', 'SHORTLISTED', 'APPOINTED', 'CANCELLED'],
    requirements: ['PENDING', 'MATCHED', 'TUTOR_SELECTED', 'COMPLETED', 'CANCELLED'],
    applications: ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
};

export const AdminDashboard: React.FC = () => {
    const { showToast } = useToast();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [resource, setResource] = useState<AdminResource>('users');
    const [data, setData] = useState<AdminResourceResponse | null>(null);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        dashboardApi.getOverview().then(setOverview).catch(() => setError('Unable to load the admin overview.')).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoading(true);
        dashboardApi.getAdminResource(resource, { page, page_size: 10, search, role: resource === 'users' ? role : undefined, status: resource !== 'users' ? status : undefined })
            .then(setData)
            .catch((err) => setError(getApiErrorMessage(err, 'Unable to load this admin resource.')))
            .finally(() => setLoading(false));
    }, [resource, page, search, role, status]);

    const changeResource = (next: AdminResource) => {
        setResource(next);
        setPage(1);
        setSearch('');
        setRole('');
        setStatus('');
        setError('');
    };

    const performAction = async (record: AdminRecord, action: string, value?: string | boolean) => {
        const identifier = String(record.id || record.tutor_id || record.job_id || record.requirement_id || '');
        try {
            await dashboardApi.updateAdminResource(resource, identifier, action, value);
            showToast('Admin action completed successfully.', 'success');
            const refreshed = await dashboardApi.getAdminResource(resource, { page, page_size: 10, search, role: resource === 'users' ? role : undefined, status: resource !== 'users' ? status : undefined });
            setData(refreshed);
        } catch (err) {
            showToast(getApiErrorMessage(err, 'The admin action could not be completed.'), 'error');
        }
    };

    if (loading && !overview && !data) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading admin console...</div>;
    if (error && !overview && !data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>;

    const stats = overview?.stats || {};
    const cards = [
        ['Total Users', stats.total_users], ['Tutors', stats.total_tutors], ['Parents', stats.total_parents], ['Students', stats.total_students],
        ['Jobs', stats.total_jobs], ['Active Jobs', stats.active_jobs], ['Applications', stats.total_applications], ['Requirements', stats.total_requirements],
    ];

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:p-8"><span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold">Admin Operations</span><h2 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">Platform governance</h2><p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">Review every user-generated record and moderate marketplace activity from one workspace.</p></div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"><span className="text-[11px] font-bold uppercase text-slate-500">{label}</span><h3 className="mt-1 font-heading text-2xl font-black text-slate-900">{Number(value || 0).toLocaleString()}</h3></div>)}</div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{resources.map((item) => <button key={item.key} type="button" onClick={() => changeResource(item.key)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${resource === item.key ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.icon}{item.label}</button>)}</div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${resource}...`} className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-500" /></div>{resource === 'users' ? <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="">All roles</option><option value="TUTOR">Tutors</option><option value="PARENT">Parents</option><option value="STUDENT">Students</option><option value="ADMIN">Admins</option></select> : <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="">All statuses</option>{statusOptions[resource].map((option) => <option key={option} value={option}>{option}</option>)}</select>}</div></div>{error && <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}<AdminTable resource={resource} data={data} loading={loading} onAction={performAction} /></section>

            {data && data.total_pages > 1 && <Pagination currentPage={page} totalPages={data.total_pages} onPageChange={setPage} />}
        </div>
    );
};

const AdminTable: React.FC<{ resource: AdminResource; data: AdminResourceResponse | null; loading: boolean; onAction: (record: AdminRecord, action: string, value?: string | boolean) => void }> = ({ resource, data, loading, onAction }) => {
    if (loading) return <div className="p-10 text-center text-sm text-slate-500">Loading records...</div>;
    if (!data?.results.length) return <div className="p-10 text-center text-sm text-slate-500">No {resource} records match the current filters.</div>;
    return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Record</th><th className="px-5 py-3">Details</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{data.results.map((record) => <tr key={String(record.id || record.tutor_id || record.job_id || record.requirement_id)} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-slate-900">{String(record.name || record.title || record.student_name || record.job_title || record.requirement_id || record.job_id || 'Record')}</p><p className="mt-1 text-slate-400">{String(record.email || record.tutor_id || record.job_id || record.requirement_id || '')}</p></td><td className="px-5 py-4 text-slate-600">{resource === 'users' ? `${String(record.role)} · ${record.is_active ? 'Active' : 'Inactive'}` : resource === 'tutors' ? `${String(record.university || '')} · ${String(record.city || '')}` : resource === 'jobs' ? `${String(record.city || '')}, ${String(record.area || '')} · ${String(record.applications_count || 0)} applications` : resource === 'requirements' ? `${String(record.parent_name || '')} · ৳${String(record.budget || 0)}` : `${String(record.tutor_name || '')} · ৳${String(record.expected_salary || 0)}`}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-600">{String(record.verification_status || record.status || (record.is_active ? 'ACTIVE' : 'INACTIVE'))}</span></td><td className="px-5 py-4 text-slate-500">{formatDate(record.date_joined || record.created_at)}</td><td className="px-5 py-4 text-right"><ActionButtons resource={resource} record={record} onAction={onAction} /></td></tr>)}</tbody></table></div>;
};

const ActionButtons: React.FC<{ resource: AdminResource; record: AdminRecord; onAction: (record: AdminRecord, action: string, value?: string | boolean) => void }> = ({ resource, record, onAction }) => {
    if (resource === 'users') return <button type="button" onClick={() => onAction(record, 'set_active', !record.is_active)} className="cursor-pointer rounded-md border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50">{record.is_active ? 'Deactivate' : 'Activate'}</button>;
    if (resource === 'tutors') return <div className="flex justify-end gap-2">{record.verification_status !== 'VERIFIED' && <button type="button" onClick={() => onAction(record, 'verify')} className="cursor-pointer rounded-md bg-emerald-500 px-2.5 py-1.5 font-bold text-white">Verify</button>}<button type="button" onClick={() => onAction(record, 'toggle_available')} className="cursor-pointer rounded-md border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600">{record.is_available ? 'Pause' : 'Enable'}</button></div>;
    const options = statusOptions[resource];
    return <select value={String(record.status || '')} onChange={(event) => onAction(record, 'set_status', event.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-[11px] font-bold"><option value="">Change status</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
};

const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : 'Not available';
