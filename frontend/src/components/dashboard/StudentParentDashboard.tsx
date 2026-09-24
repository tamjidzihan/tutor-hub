import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requirementsApi } from '../../api/requirements';
import type { TutorRequirement } from '../../types';

export const StudentParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<TutorRequirement[]>([]);
  const [selectedTutorMessage, setSelectedTutorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const reqs = await requirementsApi.getMyRequirements();
        setRequirements(reqs);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleSelectTutor = async (reqId: string, tutorId: string) => {
    await requirementsApi.selectTutor(reqId, tutorId);
    setSelectedTutorMessage(`Tutor ${tutorId} selected for requirement ${reqId}! Our verification coordinator will arrange your free demo class.`);
    const updated = await requirementsApi.getMyRequirements();
    setRequirements(updated);
    setTimeout(() => setSelectedTutorMessage(''), 5000);
  };

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-md">
            Parent & Student Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Welcome, {user?.first_name} {user?.last_name}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg">
            Manage your posted tuition requirements, review verified tutor CV matches, and schedule trial demo sessions.
          </p>
        </div>

        <Link
          to="/appoint-a-tutor"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shrink-0 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Post New Requirement
        </Link>
      </div>

      {selectedTutorMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{selectedTutorMessage}</span>
        </div>
      )}

      {/* Requirements List & Matched Tutors */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Your Posted Requirements</h3>
          <span className="text-xs font-bold text-slate-500">{requirements.length} Active Posts</span>
        </div>

        {requirements.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-6">

            {/* Requirement Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-navy-950 text-white font-mono text-xs font-bold">
                    {req.requirement_id}
                  </span>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    Status: {req.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">
                  Tutor for {req.student_name} ({req.class_level} — {req.curriculum})
                </h4>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Budget</span>
                <span className="text-lg font-black text-slate-900 font-heading">৳{req.budget.toLocaleString()} / mo</span>
              </div>
            </div>

            {/* Requirement Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl">
              <div>
                <span className="text-slate-400 block font-medium">Location:</span>
                <strong className="text-slate-800">{req.area}, {req.city}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Subjects:</span>
                <strong className="text-slate-800">{req.subjects.join(', ')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Preferred Gender:</span>
                <strong className="text-slate-800">{req.preferred_tutor_gender} Tutor</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Days / Week:</span>
                <strong className="text-slate-800">{req.days_per_week} Days ({req.preferred_time || 'Evening'})</strong>
              </div>
            </div>

            {/* Matched Tutors Subsection (Section 30 & 31) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h5 className="text-sm font-bold text-slate-900">Recommended Tutor Matches (AI Algorithm)</h5>
                </div>
                <span className="text-xs text-slate-500 font-medium">Based on subject mastery & location proximity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(req.matched_tutors || []).map((match) => {
                  const isSelected = req.selected_tutor_id === match.tutor_id;

                  return (
                    <div
                      key={match.tutor_id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${isSelected
                          ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-400/40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={match.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                              alt={match.name || match.tutor_id}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <h6 className="text-sm font-bold text-slate-900">{match.name || 'Verified Tutor'}</h6>
                                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                              </div>
                              <p className="text-[11px] font-semibold text-brand-700">{match.university || 'Top University'}</p>
                              <p className="text-[10px] text-slate-500">{match.department || 'Department'}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-brand-100 text-brand-800">
                              {match.score}% Match
                            </span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="space-y-1 mb-4">
                          {(match.matching_reasons || []).map((r, ri) => (
                            <div key={ri} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-brand-500 shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={`/hub/tutor-details/${match.tutor_id}`}
                          className="text-xs font-bold text-slate-700 hover:text-brand-600"
                        >
                          View Full CV
                        </Link>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tutor Selected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectTutor(req.id, match.tutor_id)}
                            className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
                          >
                            Select Tutor
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
