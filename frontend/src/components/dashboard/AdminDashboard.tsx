import React, { useState, useEffect } from 'react';
import { contentApi, type PlatformStats } from '../../api/content';
import { tutorsApi } from '../../api/tutors';
import type { Tutor } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    registeredTutors: 145000,
    liveTuitionJobs: 340,
    happyParents: 85000,
    verifiedTeachers: 68000,
    satisfactionRate: 98.4,
    avgResponseHours: 2.4,
  });
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, tutorsRes] = await Promise.all([
          contentApi.getStats(),
          tutorsApi.getTutors(),
        ]);
        setStats(statsData);
        setTutors(tutorsRes.results.slice(0, 6));
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
          Super Admin Management Console
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-heading mt-2 text-white">
          Platform Governance & Verification
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Monitor system metrics, review pending tutor credentials, moderate tuition job postings, and handle affiliate payouts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Tutors</span>
          <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats.registeredTutors.toLocaleString()}
          </h4>
          <span className="text-xs text-brand-600 font-semibold">+142 this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Live Tuition Jobs</span>
          <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats.liveTuitionJobs.toLocaleString()}
          </h4>
          <span className="text-xs text-brand-600 font-semibold">{stats.satisfactionRate}% fill rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Happy Parents</span>
          <h4 className="text-2xl font-black text-amber-600 font-heading mt-1">
            {stats.happyParents.toLocaleString()}
          </h4>
          <span className="text-xs text-slate-400">Verified Parent Inquiries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Verified Teachers</span>
          <h4 className="text-2xl font-black text-slate-900 font-heading mt-1">
            {stats.verifiedTeachers.toLocaleString()}
          </h4>
          <span className="text-xs text-emerald-600 font-semibold">NID / University Checked</span>
        </div>
      </div>

      {/* Tutor Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Tutor Submissions</h3>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
            Requires Document Check
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading submissions...</div>
          ) : tutors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No tutor submissions found.</div>
          ) : (
            tutors.map((tutor) => (
              <div key={tutor.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={tutor.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={tutor.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{tutor.name}</h4>
                      <span className="text-xs font-mono font-bold text-slate-400">{tutor.tutor_id}</span>
                    </div>
                    <p className="text-xs text-slate-500">{tutor.university} • {tutor.department}</p>
                    <p className="text-[11px] text-slate-400">Area: {tutor.area}, {tutor.city} • Expected: ৳{tutor.expected_salary?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">
                    Approve & Verify
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50">
                    Request Resubmit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
