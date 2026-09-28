import React, { useEffect, useState } from 'react';
import {
    AlertTriangle,
    Briefcase,
    CheckCircle2,
    ClipboardList,
    Eye,
    GraduationCap,
    Info,
    RefreshCw,
    Search,
    ShieldAlert,
    Trash2,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import {
    dashboardApi,
    type AdminRecord,
    type AdminResource,
    type AdminResourceResponse,
} from '../../api/dashboard';
import { Pagination } from '../common/Pagination';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';

const STATUS_CHOICES: Record<AdminResource, string[]> = {
    users: [],
    tutors: ['PENDING', 'VERIFIED', 'REJECTED'],
    jobs: ['AVAILABLE', 'SHORTLISTED', 'APPOINTED', 'CANCELLED'],
    requirements: ['PENDING', 'MATCHED', 'TUTOR_SELECTED', 'COMPLETED', 'CANCELLED'],
    applications: ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
};

interface AdminResourceManagementProps {
    resource: AdminResource;
    title?: string;
    subtitle?: string;
}

export const AdminResourceManagement: React.FC<AdminResourceManagementProps> = ({
    resource,
    title,
    subtitle,
}) => {
    const { showToast } = useToast();
    const [data, setData] = useState<AdminResourceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Modal states
    const [selectedRecord, setSelectedRecord] = useState<AdminRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await dashboardApi.getAdminResource(resource, {
                page: currentPage,
                page_size: pageSize,
                search: searchQuery.trim() || undefined,
                role: resource === 'users' && roleFilter ? roleFilter : undefined,
                status: resource !== 'users' && statusFilter ? statusFilter : undefined,
            });
            setData(res);
        } catch (err) {
            showToast(getApiErrorMessage(err, `Failed to load ${resource} records.`), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [resource, currentPage, searchQuery, roleFilter, statusFilter]);

    const handlePerformAction = async (
        record: AdminRecord,
        action: string,
        value?: string | boolean
    ) => {
        const id = String(record.id || record.tutor_id || record.job_id || record.requirement_id || '');
        setActionInProgress(id);
        try {
            const response = await dashboardApi.updateAdminResource(resource, id, action, value);
            showToast(response.detail || 'Action updated successfully.', 'success');
            await fetchRecords();

            if (selectedRecord) {
                const refreshed = await dashboardApi.getAdminResourceItem(resource, id);
                setSelectedRecord(refreshed);
            }
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to apply admin action.'), 'error');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const id = String(deleteTarget.id || deleteTarget.tutor_id || deleteTarget.job_id || deleteTarget.requirement_id || '');
        setIsDeleting(true);
        try {
            const response = await dashboardApi.deleteAdminResource(resource, id);
            showToast(response.detail || 'Record permanently deleted.', 'success');
            setDeleteTarget(null);
            if (selectedRecord && String(selectedRecord.id || selectedRecord.tutor_id || selectedRecord.job_id || selectedRecord.requirement_id) === id) {
                setSelectedRecord(null);
            }
            await fetchRecords();
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Failed to delete record.'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const defaultTitle = resource === 'users'
        ? 'User Directory'
        : resource === 'tutors'
        ? 'Tutor Verification Queue'
        : resource === 'jobs'
        ? 'Tuition Jobs Moderation'
        : resource === 'requirements'
        ? 'Tutor Requests & Inquiries'
        : 'Applications Governance';

    const defaultSubtitle = resource === 'users'
        ? 'Review registered accounts. Note: Admin can delete accounts, but cannot modify private user credentials.'
        : resource === 'tutors'
        ? 'Review educational credentials, verify teacher identities, and toggle availability.'
        : resource === 'jobs'
        ? 'Moderate live tuition jobs, inspect parent requirements, and audit applicant submissions.'
        : resource === 'requirements'
        ? 'Inspect student requirements, review matching tutors, and fulfill learning requests.'
        : 'Audit tutor applications, expected salaries, and proposal messages across all tuition posts.';

    return (
        <div className="space-y-6 pb-12">
            {/* Header Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                        {resource === 'users' && <Users className="h-3.5 w-3.5" />}
                        {resource === 'tutors' && <UserCheck className="h-3.5 w-3.5" />}
                        {resource === 'jobs' && <Briefcase className="h-3.5 w-3.5" />}
                        {resource === 'requirements' && <ClipboardList className="h-3.5 w-3.5" />}
                        {resource === 'applications' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        <span>Admin Governance</span>
                    </div>
                    <h1 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">
                        {title || defaultTitle}
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
                        {subtitle || defaultSubtitle}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchRecords}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                    </button>
                </div>
            </div>

            {/* Management Table Section */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-heading text-base font-black text-slate-900 capitalize">
                            {title || defaultTitle}
                        </h2>
                        <span className="text-xs text-slate-500">
                            {data ? `${data.count} total records indexed` : 'Loading index...'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative min-w-[240px]">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder={`Search ${resource}...`}
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-8 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
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
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
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

                {/* Status Notice Banner for Users */}
                {resource === 'users' && (
                    <div className="flex items-center justify-between bg-amber-50/70 px-5 py-2.5 text-xs text-amber-800 border-b border-amber-100">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                            <Info className="h-3.5 w-3.5 text-amber-600" />
                            Read-Only User Directory Policy: Administrator cannot alter user profile data. Delete authority is permitted.
                        </span>
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
                                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
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
                                        <p className="mt-1 text-xs">Try adjusting your search query or filter criteria.</p>
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
                                                    <div className="mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                        {(resource === 'users' && record.profile_image) ? (
                                                            <img src={String(record.profile_image)} alt="" className="h-full w-full object-cover" />
                                                        ) : (resource === 'tutors' && (record.profile_photo || record.profile_image)) ? (
                                                            <img src={String(record.profile_photo || record.profile_image)} alt="" className="h-full w-full object-cover" />
                                                        ) : resource === 'users' ? (
                                                            <div className="font-bold text-xs text-brand-700">{String(record.name || record.email || '?')[0].toUpperCase()}</div>
                                                        ) : resource === 'tutors' ? (
                                                            <div className="font-bold text-xs text-brand-700">{String(record.name || '?')[0].toUpperCase()}</div>
                                                        ) : resource === 'jobs' ? (
                                                            <Briefcase className="h-4 w-4 text-slate-600" />
                                                        ) : resource === 'requirements' ? (
                                                            <ClipboardList className="h-4 w-4 text-slate-600" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 text-slate-600" />
                                                        )}
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
                                                        onClick={() => setSelectedRecord(record)}
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
                                                                    onClick={() => handlePerformAction(record, 'verify')}
                                                                    className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                                >
                                                                    Verify
                                                                </button>
                                                            )}
                                                            {record.verification_status === 'PENDING' && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isBusy}
                                                                    onClick={() => handlePerformAction(record, 'reject')}
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
                                                            onChange={(e) => handlePerformAction(record, 'set_status', e.target.value)}
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
                                                        onClick={() => setDeleteTarget(record)}
                                                        className="rounded-lg border border-rose-100 bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                                                        title={`Permanently delete this record`}
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
                        <Pagination currentPage={currentPage} totalPages={data.total_pages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </section>

            {/* Detailed Dossier Modal */}
            {selectedRecord && (
                <RecordDetailModal
                    resource={resource}
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    onAction={(action, value) => handlePerformAction(selectedRecord, action, value)}
                    onDelete={() => setDeleteTarget(selectedRecord)}
                    actionInProgress={actionInProgress}
                />
            )}

            {/* Deletion Confirmation Modal */}
            {deleteTarget && (
                <DeleteConfirmationModal
                    resource={resource}
                    record={deleteTarget}
                    isDeleting={isDeleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
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
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                    <span className="font-bold">Privacy & Integrity Constraint:</span>
                    <p className="mt-0.5 text-amber-700">
                        Administrators cannot edit or alter user credentials, passwords, or personal profile data. You may only review account activity or permanently remove the account if it violates community guidelines.
                    </p>
                </div>
            </div>

            {/* User Profile Header Card */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {record.profile_image ? (
                    <img
                        src={String(record.profile_image)}
                        alt={String(record.name || 'User')}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-xs"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 font-bold text-brand-700 text-xl ring-2 ring-brand-500/20 shadow-xs">
                        {String(record.name || record.email || '?')[0].toUpperCase()}
                    </div>
                )}
                <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-base">{String(record.name || 'Not provided')}</h3>
                    <p className="text-xs text-slate-500 font-mono">{String(record.email)}</p>
                    <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 border border-brand-200">
                        {String(record.role)}
                    </span>
                </div>
            </div>

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

            {/* Tutor Profile Header with Photo */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {record.profile_photo || record.profile_image ? (
                    <img
                        src={String(record.profile_photo || record.profile_image)}
                        alt={String(record.name || 'Tutor')}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-xs"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 font-bold text-brand-700 text-xl ring-2 ring-brand-500/20 shadow-xs">
                        {String(record.name || record.email || '?')[0].toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-slate-900 text-base">{String(record.name || 'Tutor Profile')}</h3>
                    <p className="text-xs text-slate-500 font-mono">{String(record.email || '')}</p>
                    {Boolean(record.headline) && (
                        <p className="text-xs text-slate-600 mt-0.5">{String(record.headline)}</p>
                    )}
                </div>
            </div>

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
