import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, type DashboardOverview } from '../../api/dashboard';
import { requirementsApi } from '../../api/requirements';
import type { TutorRequirement } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/client';

export const StudentParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [requirements, setRequirements] = useState<TutorRequirement[]>([]);
    const [selectedTutorMessage, setSelectedTutorMessage] = useState('');
    const [error, setError] = useState('');

    const loadData = async () => {
        try {
            const [overviewData, requirementsData] = await Promise.all([dashboardApi.getOverview(), requirementsApi.getMyRequirements()]);
            setOverview(overviewData);
            setRequirements(requirementsData);
        } catch {
            setError('Unable to load your requirements. Please try again.');
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSelectTutor = async (reqId: string, tutorId: string) => {
        try {
            await requirementsApi.selectTutor(reqId, tutorId);
            setSelectedTutorMessage('Tutor selection was saved successfully.');
            showToast('Tutor selection saved successfully.', 'success');
            await loadData();
        } catch (err) {
            showToast(getApiErrorMessage(err, 'Unable to select this tutor. Please try again.'), 'error');
        }
    };

    if (error && !overview) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>;
    if (!overview) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading your requirements...</div>;

    const stats = overview.stats;
    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8"><div><span className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-bold">{user?.role === 'STUDENT' ? 'Student Portal' : 'Parent Portal'}</span><h2 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">Welcome, {user?.first_name} {user?.last_name}!</h2><p className="mt-1 max-w-lg text-xs text-slate-300 sm:text-sm">Manage your saved tuition requirements and review tutor matches returned by the platform.</p></div>{user?.role === 'PARENT' && <Link to="/appoint-a-tutor" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"><Plus className="h-4 w-4" />Post Requirement</Link>}</div>
            +
            +      {selectedTutorMessage && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{selectedTutorMessage}</div>}
            +      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            +      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3"><Metric label="Total Requirements" value={stats.total_requirements} /><Metric label="Active Requirements" value={stats.active_requirements} /><Metric label="Applications Received" value={stats.applications_received} /></div>
            +
            +      <section className="space-y-6"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">Your Tuition Requirements</h3><span className="text-xs font-bold text-slate-500">{requirements.length} saved</span></div>{requirements.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No tuition requirements yet. Create one to start finding tutors.</div> : requirements.map((req) => <div key={req.id} className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className="rounded-md bg-navy-950 px-2.5 py-1 font-mono text-xs font-bold text-white">{req.requirement_id}</span><span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600">{req.status}</span></div><h4 className="mt-2 text-base font-bold text-slate-900">Tutor for {req.student_name} ({req.class_level} · {req.curriculum})</h4></div><div className="text-left sm:text-right"><span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Budget</span><span className="font-heading text-lg font-black text-slate-900">৳{req.budget.toLocaleString()} / mo</span></div></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 sm:grid-cols-4"><Info label="Location" value={`${req.area}, ${req.city}`} /><Info label="Subjects" value={req.subjects.join(', ')} /><Info label="Preferred Gender" value={req.preferred_tutor_gender} /><Info label="Schedule" value={`${req.days_per_week} days${req.preferred_time ? `, ${req.preferred_time}` : ''}`} /></div><div className="space-y-3"><h5 className="text-sm font-bold text-slate-900">Tutor Matches</h5>{!req.matched_tutors?.length ? <p className="text-sm text-slate-500">No tutor matches yet.</p> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{req.matched_tutors.map((match) => { const isSelected = req.selected_tutor_id === match.tutor_id; return <div key={match.tutor_id} className={`rounded-xl border p-4 ${isSelected ? 'border-brand-500 bg-brand-50/70' : 'border-slate-200 bg-white'}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-1"><h6 className="text-sm font-bold text-slate-900">{match.name || match.tutor_id}</h6><ShieldCheck className="h-3.5 w-3.5 text-brand-500" /></div>{match.university && <p className="text-[11px] font-semibold text-brand-700">{match.university}</p>}{match.department && <p className="text-[10px] text-slate-500">{match.department}</p>}</div><span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-black text-brand-800">{match.score}% Match</span></div><div className="mt-3 space-y-1">{match.matching_reasons?.map((reason) => <p key={reason} className="flex items-center gap-1.5 text-[11px] text-slate-600"><CheckCircle2 className="h-3 w-3 text-brand-500" />{reason}</p>)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><Link to={`/hub/tutor-details/${match.tutor_id}`} className="text-xs font-bold text-slate-700 hover:text-brand-600">View Profile</Link>{isSelected ? <span className="text-xs font-bold text-emerald-700">Tutor Selected</span> : <button onClick={() => handleSelectTutor(req.requirement_id, match.tutor_id)} className="rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-600">Select Tutor</button>}</div></div>; })}</div>}</div></div>)}</section>
            +    </div>
    );
};

const Metric: React.FC<{ label: string; value: unknown }> = ({ label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><span className="text-xs font-bold uppercase text-slate-500">{label}</span><h4 className="mt-1 font-heading text-2xl font-black text-slate-900">{typeof value === 'number' ? value.toLocaleString() : String(value ?? 0)}</h4></div>;
const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><span className="block text-slate-400">{label}</span><strong className="text-slate-800">{value || 'Not provided'}</strong></div>;
