import React, { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Briefcase,
    CheckCircle2,
    ClipboardList,
    Eye,
    GraduationCap,
    Info,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
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
    type AdminResourceResponse,
    type DashboardOverview,
} from '../../api/dashboard';
import { Pagination } from '../common/Pagination';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';

type TabKey = 'overview' | AdminResource;

interface TabConfig {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    badgeCountKey?: string;
}

const TABS: TabConfig[] = [
    { key: 'overview', label: 'Analytics & Insights', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'users', label: 'User Directory', icon: <Users className="h-4 w-4" />, badgeCountKey: 'total_users' },
    { key: 'tutors', label: 'Tutor Verification', icon: <UserCheck className="h-4 w-4" />, badgeCountKey: 'pending_tutors' },
    { key: 'jobs', label: 'Tuition Jobs', icon: <Briefcase className="h-4 w-4" />, badgeCountKey: 'active_jobs' },
    { key: 'requirements', label: 'Tutor Requests', icon: <ClipboardList className="h-4 w-4" />, badgeCountKey: 'pending_requirements' },
    { key: 'applications', label: 'Applications', icon: <CheckCircle2 className="h-4 w-4" />, badgeCountKey: 'total_applications' },
];

const STATUS_CHOICES: Record<AdminResource, string[]> = {
    users: [],
    tutors: ['PENDING', 'VERIFIED', 'REJECTED'],
    jobs: ['AVAILABLE', 'SHORTLISTED', 'APPOINTED', 'CANCELLED'],
    requirements: ['PENDING', 'MATCHED', 'TUTOR_SELECTED', 'COMPLETED', 'CANCELLED'],
    applications: ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
};

export const AdminDashboard: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    // Resource table states
    const [resourceData, setResourceData] = useState<AdminResourceResponse | null>(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Modal states
    const [selectedRecord, setSelectedRecord] = useState<{ resource: AdminResource; data: AdminRecord } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ resource: AdminResource; record: AdminRecord } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    // Analytics Chart Selection
    const [analyticsMetric, setAnalyticsMetric] = useState<'users' | 'jobs' | 'requirements' | 'applications'>('users');

    const fetchOverview = async () => {
        setOverviewLoading(true);
        try {
            const data = await dashboardApi.getOverview();
            setOverview(data);
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to load platform analytics.'), 'error');
        } finally {
            setOverviewLoading(false);
        }
    };

    const fetchResourceData = async (
        targetResource: AdminResource,
        page: number,
        search: string,
        role: string,
        status: string
    ) => {
        setTableLoading(true);
        try {
            const res = await dashboardApi.getAdminResource(targetResource, {
                page,
                page_size: pageSize,
                search: search.trim() || undefined,
                role: targetResource === 'users' && role ? role : undefined,
                status: targetResource !== 'users' && status ? status : undefined,
            });
            setResourceData(res);
        } catch (err) {
            showToast(getApiErrorMessage(err, `Failed to load ${targetResource} records.`), 'error');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    useEffect(() => {
        if (activeTab !== 'overview') {
            fetchResourceData(activeTab, currentPage, searchQuery, roleFilter, statusFilter);
        }
    }, [activeTab, currentPage, searchQuery, roleFilter, statusFilter]);

    const handleTabChange = (nextTab: TabKey) => {
        setActiveTab(nextTab);
        setCurrentPage(1);
        setSearchQuery('');
        setRoleFilter('');
        setStatusFilter('');
    };

    const handleInspectRecord = (res: AdminResource, record: AdminRecord) => {
        setSelectedRecord({ resource: res, data: record });
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
            
            await fetchResourceData(res, currentPage, searchQuery, roleFilter, statusFilter);
            fetchOverview();

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
            if (selectedRecord && String(selectedRecord.data.id || selectedRecord.data.tutor_id || selectedRecord.data.job_id || selectedRecord.data.requirement_id) === id) {
                setSelectedRecord(null);
            }

            await fetchResourceData(res, currentPage, searchQuery, roleFilter, statusFilter);
            fetchOverview();
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to delete record.'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const stats = overview?.stats || {};

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
                            Platform Governance & Oversight
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
                            Real-time platform health, comprehensive marketplace moderation, applicant audits, and verified teacher approvals.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                fetchOverview();
                                if (activeTab !== 'overview') {
                                    fetchResourceData(activeTab, currentPage, searchQuery, roleFilter, statusFilter);
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${overviewLoading || tableLoading ? 'animate-spin' : ''}`} />
                            <span>Sync Metrics</span>
                        </button>
                    </div>
                </div>

                {/* Quick Navigation Tabs */}
                <div className="relative z-10 mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const badgeVal = tab.badgeCountKey ? Number(stats[tab.badgeCountKey] || 0) : null;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-white text-navy-950 shadow-lg'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {badgeVal !== null && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                            isActive ? 'bg-navy-950 text-white' : 'bg-white/20 text-white'
                                        }`}
                                    >
                                        {badgeVal.toLocaleString()}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' ? (
                <OverviewTab
                    overview={overview}
                    loading={overviewLoading}
                    analyticsMetric={analyticsMetric}
                    onMetricChange={setAnalyticsMetric}
                    onNavigateTab={handleTabChange}
                    onInspectRecord={handleInspectRecord}
                />
            ) : (
                <ResourceManagementTab
                    resource={activeTab}
                    data={resourceData}
                    loading={tableLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onInspect={(record) => handleInspectRecord(activeTab, record)}
                    onAction={(record, action, value) => handlePerformAction(activeTab, record, action, value)}
                    onDelete={(record) => setDeleteTarget({ resource: activeTab, record })}
                    actionInProgress={actionInProgress}
                />
            )}

            {/* Detailed Inspection Modal */}
            {selectedRecord && (
                <RecordDetailModal
                    resource={selectedRecord.resource}
                    record={selectedRecord.data}
                    onClose={() => setSelectedRecord(null)}
                    onAction={(action, value) => handlePerformAction(selectedRecord.resource, selectedRecord.data, action, value)}
                    onDelete={() => {
                        setDeleteTarget({ resource: selectedRecord.resource, record: selectedRecord.data });
                    }}
                    actionInProgress={actionInProgress}
                />
            )}

            {/* Deletion Confirmation Modal */}
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
// OVERVIEW TAB: ANALYTICS, CHARTS & DISTRIBUTION
// =====================================================================

interface OverviewTabProps {
    overview: DashboardOverview | null;
    loading: boolean;
    analyticsMetric: 'users' | 'jobs' | 'requirements' | 'applications';
    onMetricChange: (metric: 'users' | 'jobs' | 'requirements' | 'applications') => void;
    onNavigateTab: (tab: TabKey) => void;
    onInspectRecord: (resource: AdminResource, record: AdminRecord) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    overview,
    loading,
    analyticsMetric,
    onMetricChange,
    onNavigateTab,
    onInspectRecord,
}) => {
    if (loading && !overview) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
                ))}
            </div>
        );
    }

    const stats = overview?.stats || {};
    const distributions = overview?.distributions;
    const analytics = overview?.analytics;
    const recentActivity = overview?.recent_activity;

    // Daily volume metrics
    const currentChartData = (analytics && analytics[analyticsMetric]) || [];
    const totalVolumeInWeek = currentChartData.reduce((acc, curr) => acc + curr.count, 0);
    const maxDayCount = Math.max(...currentChartData.map((d) => d.count), 1);

    return (
        <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Users KPI */}
                <div
                    onClick={() => onNavigateTab('users')}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-blue-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <Users className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                            View all <ArrowUpRight className="ml-1 h-3 w-3" />
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
                </div>

                {/* Jobs KPI */}
                <div
                    onClick={() => onNavigateTab('jobs')}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-sky-400 hover:shadow-lg"
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
                </div>

                {/* Tutor Requirements KPI */}
                <div
                    onClick={() => onNavigateTab('requirements')}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-amber-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                            <ClipboardList className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                            Review <ArrowUpRight className="ml-1 h-3 w-3" />
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
                </div>

                {/* Tutor Verification Queue KPI */}
                <div
                    onClick={() => onNavigateTab('tutors')}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-emerald-400 hover:shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                            <UserCheck className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                            Audit queue <ArrowUpRight className="ml-1 h-3 w-3" />
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
                </div>
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
                                onClick={() => onMetricChange(metric)}
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
                        <button
                            type="button"
                            onClick={() => onNavigateTab('jobs')}
                            className="text-xs font-bold text-brand-600 hover:underline"
                        >
                            Open Jobs View &rarr;
                        </button>
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
                                            onClick={() => onInspectRecord('jobs', job)}
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
                        <button
                            type="button"
                            onClick={() => onNavigateTab('requirements')}
                            className="text-xs font-bold text-brand-600 hover:underline"
                        >
                            Open Inquiries View &rarr;
                        </button>
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
                                            onClick={() => onInspectRecord('requirements', req)}
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
        </div>
    );
};

// =====================================================================
// RESOURCE MANAGEMENT TAB (USERS, TUTORS, JOBS, REQUIREMENTS, APPS)
// =====================================================================

interface ResourceManagementTabProps {
    resource: AdminResource;
    data: AdminResourceResponse | null;
    loading: boolean;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    roleFilter: string;
    onRoleFilterChange: (val: string) => void;
    statusFilter: string;
    onStatusFilterChange: (val: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    onInspect: (record: AdminRecord) => void;
    onAction: (record: AdminRecord, action: string, value?: string | boolean) => void;
    onDelete: (record: AdminRecord) => void;
    actionInProgress: string | null;
}

const ResourceManagementTab: React.FC<ResourceManagementTabProps> = ({
    resource,
    data,
    loading,
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    statusFilter,
    onStatusFilterChange,
    currentPage,
    onPageChange,
    onInspect,
    onAction,
    onDelete,
    actionInProgress,
}) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            {/* Action Bar & Search */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="font-heading text-lg font-black text-slate-900 capitalize">
                        {resource === 'users' ? 'User Directory' : `${resource} Management`}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {resource === 'users' && 'Review registered accounts. Note: Admin can delete accounts, but cannot modify private user credentials.'}
                        {resource === 'tutors' && 'Review educational credentials, verify teacher identities, and toggle availability.'}
                        {resource === 'jobs' && 'Moderate live tuition jobs, inspect parent requirements and applicants.'}
                        {resource === 'requirements' && 'Inspect student requirements, review matching tutors and fulfill requests.'}
                        {resource === 'applications' && 'Audit tutor applications, expected salaries, and proposal messages.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative min-w-[240px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search ${resource}...`}
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-8 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    {resource === 'users' ? (
                        <select
                            value={roleFilter}
                            onChange={(e) => onRoleFilterChange(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
                        >
                            <option value="">All Roles</option>
                            <option value="TUTOR">Tutors</option>
                            <option value="PARENT">Parents</option>
                            <option value="STUDENT">Students</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    ) : (
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_CHOICES[resource].map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Results Count Banner */}
            {data && (
                <div className="flex items-center justify-between bg-slate-50/60 px-5 py-2.5 text-xs text-slate-500 border-b border-slate-100">
                    <span>
                        Showing {data.results.length} of {data.count} total {resource}
                    </span>
                    {resource === 'users' && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
                            <Info className="h-3.5 w-3.5" /> Read-only mode active: user profiles cannot be directly altered by admin.
                        </span>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-5 py-3.5 font-bold">Record ID & Title</th>
                            <th className="px-5 py-3.5 font-bold">Key Information</th>
                            <th className="px-5 py-3.5 font-bold">Status</th>
                            <th className="px-5 py-3.5 font-bold">Date Registered</th>
                            <th className="px-5 py-3.5 font-bold text-right">Moderation Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-slate-400">
                                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-600 mb-2" />
                                    <span>Loading {resource} records...</span>
                                </td>
                            </tr>
                        ) : !data?.results.length ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-slate-400">
                                    <p className="font-bold text-slate-600">No {resource} records found</p>
                                    <p className="mt-1 text-xs">Try adjusting your search query or status filter.</p>
                                </td>
                            </tr>
                        ) : (
                            data.results.map((record) => {
                                const recordId = String(
                                    record.id || record.tutor_id || record.job_id || record.requirement_id || ''
                                );
                                const isBusy = actionInProgress === recordId;

                                return (
                                    <tr key={recordId} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Column 1: Record Title / Identifiers */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
                                                    {resource === 'users' && <Users className="h-4 w-4" />}
                                                    {resource === 'tutors' && <UserCheck className="h-4 w-4" />}
                                                    {resource === 'jobs' && <Briefcase className="h-4 w-4" />}
                                                    {resource === 'requirements' && <ClipboardList className="h-4 w-4" />}
                                                    {resource === 'applications' && <CheckCircle2 className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {String(
                                                            record.name ||
                                                                record.title ||
                                                                record.student_name ||
                                                                record.job_title ||
                                                                'Record'
                                                        )}
                                                    </p>
                                                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                                                        {String(
                                                            record.tutor_id ||
                                                                record.job_id ||
                                                                record.requirement_id ||
                                                                record.email ||
                                                                recordId
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Key Information */}
                                        <td className="px-5 py-4 text-slate-600">
                                            {resource === 'users' && (
                                                <div className="space-y-0.5">
                                                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700">
                                                        {String(record.role)}
                                                    </span>
                                                    <p className="text-[11px] text-slate-500">{String(record.phone || 'No phone')}</p>
                                                </div>
                                            )}
                                            {resource === 'tutors' && (
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-slate-900">{String(record.university || 'University not set')}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {String(record.city || '')} · ৳{String(record.expected_salary || 0)}
                                                    </p>
                                                </div>
                                            )}
                                            {resource === 'jobs' && (
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-slate-900">
                                                        {String(record.city || '')}, {String(record.area || '')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        ৳{String(record.salary || 0)} · {String(record.applications_count || 0)} applicants
                                                    </p>
                                                </div>
                                            )}
                                            {resource === 'requirements' && (
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-slate-900">
                                                        Parent: {String(record.parent_name || 'N/A')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Budget: ৳{String(record.budget || 0)} · {String(record.class_level || '')}
                                                    </p>
                                                </div>
                                            )}
                                            {resource === 'applications' && (
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-slate-900">
                                                        Tutor: {String(record.tutor_name || 'N/A')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Offer: ৳{String(record.expected_salary || 0)} · Job: {String(record.job_id || '')}
                                                    </p>
                                                </div>
                                            )}
                                        </td>

                                        {/* Column 3: Status Badges */}
                                        <td className="px-5 py-4">
                                            <StatusBadge resource={resource} record={record} />
                                        </td>

                                        {/* Column 4: Date */}
                                        <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                                            {formatDate(record.created_at || record.date_joined)}
                                        </td>

                                        {/* Column 5: Moderation Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Full Inspect Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onInspect(record)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                    title="Inspect Full Details"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                                                    <span>Review</span>
                                                </button>

                                                {/* Tutor Specific Fast Actions */}
                                                {resource === 'tutors' && (
                                                    <>
                                                        {record.verification_status !== 'VERIFIED' && (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => onAction(record, 'verify')}
                                                                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        {record.verification_status === 'PENDING' && (
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => onAction(record, 'reject')}
                                                                className="rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Resource Status Dropdown */}
                                                {resource !== 'users' && resource !== 'tutors' && (
                                                    <select
                                                        disabled={isBusy}
                                                        value={String(record.status || '')}
                                                        onChange={(e) => onAction(record, 'set_status', e.target.value)}
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-500"
                                                    >
                                                        {STATUS_CHOICES[resource].map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => onDelete(record)}
                                                    className="rounded-lg border border-rose-100 bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                                                    title={`Permanently delete this ${resource.slice(0, -1)}`}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
                <div className="border-t border-slate-100 p-4">
                    <Pagination currentPage={currentPage} totalPages={data.total_pages} onPageChange={onPageChange} />
                </div>
            )}
        </section>
    );
};

// =====================================================================
// STATUS BADGES
// =====================================================================

const StatusBadge: React.FC<{ resource: AdminResource; record: AdminRecord }> = ({ resource, record }) => {
    if (resource === 'users') {
        const isActive = Boolean(record.is_active);
        const isVerified = Boolean(record.is_verified);
        return (
            <div className="flex flex-wrap gap-1">
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                >
                    {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
                {isVerified && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                        VERIFIED
                    </span>
                )}
            </div>
        );
    }

    if (resource === 'tutors') {
        const vStatus = String(record.verification_status || 'PENDING');
        const isAvailable = Boolean(record.is_available);
        return (
            <div className="flex flex-wrap gap-1">
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        vStatus === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : vStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                    }`}
                >
                    {vStatus}
                </span>
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isAvailable ? 'bg-slate-100 text-slate-700' : 'bg-slate-200 text-slate-500'
                    }`}
                >
                    {isAvailable ? 'Available' : 'Paused'}
                </span>
            </div>
        );
    }

    const st = String(record.status || 'UNKNOWN');
    const colorClasses =
        st === 'AVAILABLE' || st === 'APPOINTED' || st === 'COMPLETED' || st === 'SELECTED'
            ? 'bg-emerald-50 text-emerald-700'
            : st === 'PENDING' || st === 'APPLIED' || st === 'MATCHED'
            ? 'bg-amber-50 text-amber-700'
            : st === 'SHORTLISTED' || st === 'TUTOR_SELECTED'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-rose-50 text-rose-700';

    return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${colorClasses}`}>{st}</span>;
};

// =====================================================================
// COMPREHENSIVE RECORD DETAIL MODAL (FULL DOSSIER INSPECTOR)
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
    onAction,
    onDelete,
    actionInProgress,
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
                {/* Modal Header */}
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

                {/* Modal Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-6">
                    {resource === 'users' && <UserDetailsView record={record} />}

                    {resource === 'tutors' && (
                        <TutorDetailsView
                            record={record}
                            onAction={onAction}
                            actionInProgress={actionInProgress}
                        />
                    )}

                    {resource === 'jobs' && <JobDetailsView record={record} />}

                    {resource === 'requirements' && <RequirementDetailsView record={record} />}

                    {resource === 'applications' && <ApplicationDetailsView record={record} />}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Permanently</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {resource !== 'users' && resource !== 'tutors' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Status:</span>
                                <select
                                    value={String(record.status || '')}
                                    onChange={(e) => onAction('set_status', e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                                >
                                    {STATUS_CHOICES[resource].map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
        </div>
    );
};

// =====================================================================
// INDIVIDUAL DOSSIER VIEWS
// =====================================================================

const UserDetailsView: React.FC<{ record: AdminRecord }> = ({ record }) => {
    return (
        <div className="space-y-6">
            {/* Policy Notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                    <span className="font-bold">Privacy & Integrity Constraint:</span>
                    <p className="mt-0.5 text-amber-700">
                        Administrators cannot edit or alter user credentials, passwords, or personal profile data. You may only review account activity or permanently remove the account if it violates community guidelines.
                    </p>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Full Name</span>
                    <p className="mt-1 font-bold text-slate-900">{String(record.name || 'Not provided')}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
                    <p className="mt-1 font-mono font-bold text-slate-900">{String(record.email)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Phone Number</span>
                    <p className="mt-1 font-bold text-slate-900">{String(record.phone || 'Not provided')}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">System Role</span>
                    <p className="mt-1 font-bold text-brand-600">{String(record.role)}</p>
                </div>
            </div>

            {/* Account Activity Summary */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500">
                    Platform Contributions
                </h4>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-heading text-xl font-black text-slate-900">
                            {Number(record.posted_jobs_count || 0)}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500">Jobs Posted</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-heading text-xl font-black text-slate-900">
                            {Number(record.requirements_count || 0)}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500">Tutor Requests</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-heading text-xl font-black text-slate-900">
                            {Number(record.applications_count || 0)}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500">Applications</p>
                    </div>
                </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                <div>
                    <span className="font-semibold">Joined Platform:</span>{' '}
                    {formatDate(record.date_joined)}
                </div>
                <div>
                    <span className="font-semibold">Last Login:</span>{' '}
                    {record.last_login ? formatDate(record.last_login) : 'Never logged in'}
                </div>
            </div>
        </div>
    );
};

const TutorDetailsView: React.FC<{
    record: AdminRecord;
    onAction: (action: string, value?: string | boolean) => void;
    actionInProgress: string | null;
}> = ({ record, onAction, actionInProgress }) => {
    const isBusy = actionInProgress === String(record.tutor_id || record.id);

    return (
        <div className="space-y-6">
            {/* Quick Action Verification Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-navy-900 p-4 text-white">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300">Tutor ID</span>
                    <h3 className="font-mono text-base font-black text-brand-300">{String(record.tutor_id)}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAction('verify')}
                        className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                        {record.verification_status === 'VERIFIED' ? 'Re-Verify Profile' : 'Approve & Verify'}
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAction('reject')}
                        className="rounded-xl bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/30 disabled:opacity-50"
                    >
                        Reject Verification
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAction('toggle_available')}
                        className="rounded-xl border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                        {record.is_available ? 'Pause Profile' : 'Set Available'}
                    </button>
                </div>
            </div>

            {/* Academic Credentials */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <GraduationCap className="h-4 w-4 text-brand-600" />
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
                        Academic Credentials
                    </h4>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400">University / Institution</span>
                        <p className="font-bold text-slate-800">{String(record.university || 'Not specified')}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400">Department / Major</span>
                        <p className="font-bold text-slate-800">{String(record.department || 'Not specified')}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400">Degree Title & Passing Year</span>
                        <p className="font-bold text-slate-800">
                            {String(record.degree_title || 'N/A')} ({String(record.passing_year || 'N/A')})
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400">CGPA / Grade</span>
                        <p className="font-bold text-slate-800">{String(record.cgpa || 'Not provided')}</p>
                    </div>
                </div>
            </div>

            {/* Tutoring Parameters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Expected Salary</span>
                    <p className="mt-1 font-heading text-lg font-black text-slate-900">
                        ৳{Number(record.expected_salary || 0).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Experience</span>
                    <p className="mt-1 font-heading text-lg font-black text-slate-900">
                        {String(record.experience_years || 0)} Years
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Rating & Reviews</span>
                    <p className="mt-1 font-heading text-lg font-black text-amber-600">
                        ★ {Number(record.rating || 0).toFixed(1)} ({Number(record.total_reviews || 0)} reviews)
                    </p>
                </div>
            </div>

            {/* Trust & Safety Verification Details */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
                    Identity & Verification Dossier
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                    <div>
                        <span className="font-semibold text-slate-500">NID / Birth Certificate:</span>{' '}
                        <span className="font-mono font-bold text-slate-900">{String(record.nid_or_birth_cert || 'Not provided')}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-500">Profile Completion:</span>{' '}
                        <span className="font-bold text-brand-600">{String(record.profile_completion_score || 0)}%</span>
                    </div>
                </div>
            </div>

            {/* Headline & Bio */}
            <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Headline & Bio</span>
                <p className="mt-1 font-bold text-slate-900">{String(record.headline || 'No headline set')}</p>
                <p className="mt-2 text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                    {String(record.bio || 'No detailed biography provided.')}
                </p>
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
            {/* Header info */}
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

            {/* Academic Specs */}
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

            {/* Parent Contact Information */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500">
                    Parent / Poster Details
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                    <div>
                        <span className="font-semibold text-slate-400">Parent Name:</span>
                        <p className="font-bold text-slate-800">{String(record.parent_name || 'N/A')}</p>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400">Email:</span>
                        <p className="font-bold text-slate-800">{String(record.parent_email || 'Not provided')}</p>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400">Phone:</span>
                        <p className="font-bold text-slate-800">{String(record.parent_phone || 'Not provided')}</p>
                    </div>
                </div>
            </div>

            {/* Applicants List */}
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

            {/* Additional notes */}
            {Boolean(record.additional_requirements) && (
                <div className="rounded-2xl border border-slate-200 p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Additional Instructions</span>
                    <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">{String(record.additional_requirements)}</p>
                </div>
            )}
        </div>
    );
};

const ApplicationDetailsView: React.FC<{ record: AdminRecord }> = ({ record }) => {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-purple-50/70 p-5 border border-purple-100">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-800">Job: {String(record.job_id)}</span>
                    <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-900">
                        {String(record.status)}
                    </span>
                </div>
                <h3 className="mt-2 font-heading text-lg font-black text-slate-900">{String(record.job_title)}</h3>
                <p className="mt-1 text-xs text-slate-600">
                    Location: {String(record.job_city)}, {String(record.job_area)} · Job Budget: ৳{Number(record.job_salary || 0).toLocaleString()}
                </p>
            </div>

            {/* Tutor Applicant Details */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tutor Applicant
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                    <div>
                        <span className="font-semibold text-slate-400">Tutor Name:</span>
                        <p className="font-bold text-slate-800">{String(record.tutor_name)}</p>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400">University:</span>
                        <p className="font-bold text-slate-800">{String(record.tutor_university || 'Not specified')}</p>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400">Proposed Salary:</span>
                        <p className="font-bold text-brand-600">৳{Number(record.expected_salary || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Cover Message */}
            <div className="rounded-2xl border border-slate-200 p-5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Cover Message</span>
                <p className="mt-2 text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                    {String(record.cover_message || 'No cover letter attached.')}
                </p>
            </div>
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
                    {resource === 'users' && (
                        <span className="mt-1 block font-semibold text-rose-600">
                            Warning: Deleting a user account will permanently remove all associated tutor profiles, applications, and job listings. This action cannot be undone.
                        </span>
                    )}
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

// =====================================================================
// UTILS
// =====================================================================

const formatDate = (val: unknown) => {
    if (!val) return 'N/A';
    try {
        return new Date(String(val)).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid Date';
    }
};
