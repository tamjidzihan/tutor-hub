import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowUpRight,
    Briefcase,
    CheckCircle2,
    ClipboardList,
    Eye,
    RefreshCw,
    Shield,
    Trash2,
    TrendingUp,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import {
    dashboardApi,
    type AdminRecord,
    type AdminResource,
    type DashboardOverview,
} from '../../api/dashboard';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';

export const AdminDashboard: React.FC = () => {
    const { showToast } = useToast();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state for inspected stream items
    const [selectedRecord, setSelectedRecord] = useState<{ resource: AdminResource; data: AdminRecord } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ resource: AdminResource; record: AdminRecord } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    // Analytics Chart Metric Switcher
    const [analyticsMetric, setAnalyticsMetric] = useState<'users' | 'jobs' | 'requirements' | 'applications'>('users');

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const data = await dashboardApi.getOverview();
            setOverview(data);
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to load platform analytics.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const handleInspectRecord = (resource: AdminResource, record: AdminRecord) => {
        setSelectedRecord({ resource, data: record });
    };

    const handlePerformAction = async (
        res: AdminResource,
        record: AdminRecord,
        action: string,
        value?: string | boolean
    ) => {
        const id = String(record.id || record.tutor_id || record.job_id || record.requirement_id || '');
        setActionInProgress(id);
        try {
            const response = await dashboardApi.updateAdminResource(res, id, action, value);
            showToast(response.detail || 'Action updated successfully.', 'success');
            await fetchOverview();

            if (selectedRecord && selectedRecord.resource === res) {
                const refreshedItem = await dashboardApi.getAdminResourceItem(res, id);
                setSelectedRecord({ resource: res, data: refreshedItem });
            }
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to apply admin action.'), 'error');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const { resource: res, record } = deleteTarget;
        const id = String(record.id || record.tutor_id || record.job_id || record.requirement_id || '');

        setIsDeleting(true);
        try {
            const response = await dashboardApi.deleteAdminResource(res, id);
            showToast(response.detail || 'Record permanently deleted.', 'success');
            setDeleteTarget(null);
            if (
                selectedRecord &&
                String(
                    selectedRecord.data.id ||
                    selectedRecord.data.tutor_id ||
                    selectedRecord.data.job_id ||
                    selectedRecord.data.requirement_id
                ) === id
            ) {
                setSelectedRecord(null);
            }
            await fetchOverview();
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to delete record.'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const stats = overview?.stats || {};
    const distributions = overview?.distributions;
    const analytics = overview?.analytics;
    const recentActivity = overview?.recent_activity;

    // Daily chart calculations
    const currentChartData = (analytics && analytics[analyticsMetric]) || [];
    const totalVolumeInWeek = currentChartData.reduce((acc, curr) => acc + curr.count, 0);
    const maxDayCount = Math.max(...currentChartData.map((d) => d.count), 1);

    return (
        <div className="space-y-6 pb-12">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-2xl sm:p-8">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 backdrop-blur-md">
                            <Shield className="h-3.5 w-3.5" />
                            <span>System Administrator Console</span>
                        </div>
                        <h1 className="mt-3 font-heading text-2xl font-black text-white sm:text-3xl">
                            Analytics & Platform Insights
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
                            Real-time platform activity velocity, verified teacher metrics, live tuition job stats, and user distribution health.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={fetchOverview}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Sync Metrics</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Users KPI */}
                <Link
                    to="/dashboard/users"
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-blue-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <Users className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                            Directory <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                        <h3 className="mt-1 font-heading text-3xl font-black text-slate-900">
                            {Number(stats.total_users || 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-blue-700">
                            {Number(stats.total_tutors || 0)} Tutors
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-emerald-700">
                            {Number(stats.total_parents || 0)} Parents
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-amber-700">
                            {Number(stats.total_students || 0)} Students
                        </span>
                    </div>
                </Link>

                {/* Jobs KPI */}
                <Link
                    to="/dashboard/jobs"
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-sky-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
                            <Briefcase className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                            Moderate <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tuition Jobs</span>
                        <h3 className="mt-1 font-heading text-3xl font-black text-slate-900">
                            {Number(stats.total_jobs || 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            {Number(stats.active_jobs || 0)} Available
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">
                            {Number(stats.appointed_jobs || 0)} Appointed
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                            {Number(stats.shortlisted_jobs || 0)} Shortlisted
                        </span>
                    </div>
                </Link>

                {/* Tutor Requirements KPI */}
                <Link
                    to="/dashboard/requirements"
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-amber-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                            <ClipboardList className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                            Requests <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Parent Requests</span>
                        <h3 className="mt-1 font-heading text-3xl font-black text-slate-900">
                            {Number(stats.total_requirements || 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 font-bold">
                            {Number(stats.pending_requirements || 0)} Pending
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">
                            {Number(stats.matched_requirements || 0)} Matched
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            {Number(stats.completed_requirements || 0)} Done
                        </span>
                    </div>
                </Link>

                {/* Tutor Verification Queue KPI */}
                <Link
                    to="/dashboard/tutors"
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-emerald-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                            <UserCheck className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                            Audits <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Tutors</span>
                        <h3 className="mt-1 font-heading text-3xl font-black text-slate-900">
                            {Number(stats.verified_tutors || 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
                            {Number(stats.pending_tutors || 0)} Awaiting Review
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                            {Number(stats.rejected_tutors || 0)} Rejected
                        </span>
                    </div>
                </Link>
            </div>

            {/* 7-Day Activity Trend & Volume Analytics Chart */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-brand-600" />
                            <h2 className="font-heading text-lg font-black text-slate-900">7-Day Platform Activity Trends</h2>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Daily velocity and volume of platform operations across the past week.
                        </p>
                    </div>

                    {/* Metric Selector Buttons */}
                    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                        {(['users', 'jobs', 'requirements', 'applications'] as const).map((metric) => (
                            <button
                                key={metric}
                                type="button"
                                onClick={() => setAnalyticsMetric(metric)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                                    analyticsMetric === metric
                                        ? 'bg-white text-navy-950 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {metric}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trend Summary */}
                <div className="mt-5 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400">Total in last 7 days</span>
                        <p className="font-heading text-2xl font-black text-slate-900">
                            {totalVolumeInWeek} {analyticsMetric}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400">Daily Average</span>
                        <p className="font-heading text-lg font-bold text-brand-600">
                            {(totalVolumeInWeek / 7).toFixed(1)} / day
                        </p>
                    </div>
                </div>

                {/* SVG Visual Bars */}
                <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">
                    {currentChartData.map((d, index) => {
                        const heightPercent = Math.max(8, Math.round((d.count / maxDayCount) * 100));
                        const dateFormatted = new Date(d.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'numeric',
                            day: 'numeric',
                        });
                        return (
                            <div key={index} className="flex flex-col items-center">
                                <div className="flex h-36 w-full items-end justify-center rounded-xl bg-slate-50 p-1">
                                    <div
                                        style={{ height: `${heightPercent}%` }}
                                        className="w-full max-w-[36px] rounded-lg bg-gradient-to-t from-brand-600 to-indigo-500 transition-all duration-500 hover:opacity-80"
                                        title={`${d.count} ${analyticsMetric} on ${d.date}`}
                                    />
                                </div>
                                <span className="mt-2 text-xs font-black text-slate-800">{d.count}</span>
                                <span className="text-[10px] text-slate-400">{dateFormatted}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Platform Distributions & Breakdowns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Role Distributions */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                    <h3 className="font-heading text-base font-black text-slate-900">User Role Distribution</h3>
                    <p className="text-xs text-slate-500">Breakdown of registered user profiles by platform role.</p>

                    <div className="mt-5 space-y-3">
                        {distributions?.roles?.map((item, idx) => {
                            const total = Number(stats.total_users || 1);
                            const percent = Math.round((item.count / total) * 100);
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{item.name}</span>
                                        <span>
                                            {item.count} ({percent}%)
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: item.color || '#3b82f6',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Job Moderation Distribution */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                    <h3 className="font-heading text-base font-black text-slate-900">Job Status Health</h3>
                    <p className="text-xs text-slate-500">Current status states of all parent-posted tuition jobs.</p>

                    <div className="mt-5 space-y-3">
                        {distributions?.jobs?.map((item, idx) => {
                            const total = Number(stats.total_jobs || 1);
                            const percent = Math.round((item.count / total) * 100);
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{item.status}</span>
                                        <span>
                                            {item.count} ({percent}%)
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                item.status === 'Available'
                                                    ? 'bg-emerald-500'
                                                    : item.status === 'Shortlisted'
                                                    ? 'bg-blue-500'
                                                    : item.status === 'Appointed'
                                                    ? 'bg-indigo-500'
                                                    : 'bg-slate-400'
                                            }`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Live Activity Streams */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Jobs Stream */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-sky-600" />
                            <h3 className="font-heading text-sm font-black text-slate-900">Recent Tuition Jobs</h3>
                        </div>
                        <Link
                            to="/dashboard/jobs"
                            className="text-xs font-bold text-brand-600 hover:underline"
                        >
                            Open Jobs Moderation &rarr;
                        </Link>
                    </div>
                    <div className="mt-4 divide-y divide-slate-100">
                        {recentActivity?.jobs?.length ? (
                            recentActivity.jobs.map((job) => (
                                <div
                                    key={String(job.id)}
                                    className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2"
                                >
                                    <div className="max-w-[70%]">
                                        <p className="font-bold text-xs text-slate-900 truncate">
                                            {String(job.title)}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {String(job.city)}, {String(job.area)} · ৳{String(job.salary)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                            {String(job.status)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleInspectRecord('jobs', job)}
                                            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                            title="Inspect Job"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-6 text-center text-xs text-slate-400">No recent job posts</p>
                        )}
                    </div>
                </div>

                {/* Recent Requirements Stream */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-amber-600" />
                            <h3 className="font-heading text-sm font-black text-slate-900">Recent Tutor Inquiries</h3>
                        </div>
                        <Link
                            to="/dashboard/requirements"
                            className="text-xs font-bold text-brand-600 hover:underline"
                        >
                            Open Tutor Requests &rarr;
                        </Link>
                    </div>
                    <div className="mt-4 divide-y divide-slate-100">
                        {recentActivity?.requirements?.length ? (
                            recentActivity.requirements.map((req) => (
                                <div
                                    key={String(req.id)}
                                    className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2"
                                >
                                    <div className="max-w-[70%]">
                                        <p className="font-bold text-xs text-slate-900 truncate">
                                            {String(req.student_name)} (Parent: {String(req.parent_name)})
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {String(req.city)} · Budget: ৳{String(req.budget)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                            {String(req.status)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleInspectRecord('requirements', req)}
                                            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                            title="Inspect Request"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-6 text-center text-xs text-slate-400">No recent tutor requests</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Inspect Modal */}
            {selectedRecord && (
                <RecordDetailModal
                    resource={selectedRecord.resource}
                    record={selectedRecord.data}
                    onClose={() => setSelectedRecord(null)}
                    onAction={(action, value) => handlePerformAction(selectedRecord.resource, selectedRecord.data, action, value)}
                    onDelete={() => setDeleteTarget({ resource: selectedRecord.resource, record: selectedRecord.data })}
                    actionInProgress={actionInProgress}
                />
            )}

            {/* Deletion Dialog */}
            {deleteTarget && (
                <DeleteConfirmationModal
                    resource={deleteTarget.resource}
                    record={deleteTarget.record}
                    isDeleting={isDeleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
};

// =====================================================================
// RECORD DETAIL MODAL (FULL DOSSIER)
// =====================================================================

interface RecordDetailModalProps {
    resource: AdminResource;
    record: AdminRecord;
    onClose: () => void;
    onAction: (action: string, value?: string | boolean) => void;
    onDelete: () => void;
    actionInProgress: string | null;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
    resource,
    record,
    onClose,
    onDelete,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-navy-950 p-2 text-white">
                            {resource === 'users' && <Users className="h-5 w-5" />}
                            {resource === 'tutors' && <UserCheck className="h-5 w-5" />}
                            {resource === 'jobs' && <Briefcase className="h-5 w-5" />}
                            {resource === 'requirements' && <ClipboardList className="h-5 w-5" />}
                            {resource === 'applications' && <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                {resource.slice(0, -1)} Review Dossier
                            </span>
                            <h2 className="font-heading text-lg font-black text-slate-900">
                                {String(
                                    record.title ||
                                        record.name ||
                                        record.student_name ||
                                        record.job_title ||
                                        record.job_id ||
                                        record.tutor_id ||
                                        'Record Details'
                                )}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    {resource === 'jobs' && <JobDetailsView record={record} />}
                    {resource === 'requirements' && <RequirementDetailsView record={record} />}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Permanently</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                        Close Dossier
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ApplicantItem {
    id: string;
    tutor_name?: string;
    tutor_email?: string;
    expected_salary?: number;
    status?: string;
    cover_message?: string;
    created_at?: string;
}

const JobDetailsView: React.FC<{ record: AdminRecord }> = ({ record }) => {
    const applicants = (record.recent_applicants as ApplicantItem[]) || [];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600">{String(record.job_id)}</span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                        {String(record.status)}
                    </span>
                </div>
                <h3 className="mt-2 font-heading text-lg font-black text-slate-900">{String(record.title)}</h3>
                <p className="mt-1 text-xs text-slate-600">
                    Location: {String(record.city)}, {String(record.area)} · Salary: ৳{Number(record.salary || 0).toLocaleString()}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Class</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.class_level)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.curriculum)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Days/Week</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.days_per_week)} Days</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Tutor</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.preferred_tutor_gender || 'Any')}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500">
                    Submitted Applications ({applicants.length})
                </h4>
                <div className="mt-4 divide-y divide-slate-100">
                    {applicants.length > 0 ? (
                        applicants.map((app, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-xs text-slate-900">{String(app.tutor_name || 'Tutor')}</p>
                                    <p className="text-[11px] text-slate-500">
                                        Expected: ৳{String(app.expected_salary || 0)} · {String(app.tutor_email || '')}
                                    </p>
                                    {Boolean(app.cover_message) && (
                                        <p className="mt-1 text-xs text-slate-600 italic">"{String(app.cover_message)}"</p>
                                    )}
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                    {String(app.status || 'APPLIED')}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="py-4 text-center text-xs text-slate-400">No applications received yet for this job.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const RequirementDetailsView: React.FC<{ record: AdminRecord }> = ({ record }) => {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-amber-50/70 p-5 border border-amber-100">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-800">{String(record.requirement_id)}</span>
                    <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                        {String(record.status)}
                    </span>
                </div>
                <h3 className="mt-2 font-heading text-lg font-black text-slate-900">
                    Student: {String(record.student_name)} (Gender: {String(record.student_gender)})
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                    Parent: {String(record.parent_name)} · Phone: {String(record.phone)} · Email: {String(record.email)}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Class Level</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.class_level)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum</span>
                    <p className="font-bold text-slate-800 text-xs">{String(record.curriculum)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                    <p className="font-bold text-slate-800 text-xs">৳{Number(record.budget || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                    <p className="font-bold text-slate-800 text-xs">
                        {String(record.city)}, {String(record.area)}
                    </p>
                </div>
            </div>

            {Boolean(record.additional_requirements) && (
                <div className="rounded-2xl border border-slate-200 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Additional Instructions</span>
                    <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">{String(record.additional_requirements)}</p>
                </div>
            )}
        </div>
    );
};

// =====================================================================
// DELETION CONFIRMATION DIALOG
// =====================================================================

interface DeleteConfirmationModalProps {
    resource: AdminResource;
    record: AdminRecord;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    resource,
    record,
    isDeleting,
    onCancel,
    onConfirm,
}) => {
    const recordLabel = String(
        record.email ||
            record.title ||
            record.name ||
            record.job_id ||
            record.tutor_id ||
            record.requirement_id ||
            record.id
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-6 w-6" />
                </div>

                <h3 className="mt-4 font-heading text-lg font-black text-slate-900">
                    Permanently Delete {resource.slice(0, -1)}?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Are you sure you want to delete <span className="font-bold text-slate-900">{recordLabel}</span>?
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                    >
                        {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
