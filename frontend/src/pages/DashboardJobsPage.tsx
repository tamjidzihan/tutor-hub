import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { jobsApi, type JobFilterParams } from '../api/jobs';
import { locationsApi, type LocationCity } from '../api/locations';
import type { TuitionJob } from '../types';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal';
import { Pagination } from '../components/common/Pagination';
import {
  Search,
  MapPin,
  GraduationCap,
  Layers,
  Filter,
  Calendar
} from 'lucide-react';

export const DashboardJobsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modal State
  const [selectedJobToApply, setSelectedJobToApply] = useState<TuitionJob | null>(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await locationsApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    };
    loadCities();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const filters: JobFilterParams = {
        search: search || undefined,
        city: selectedCity || undefined,
        curriculum: selectedCurriculum || undefined,
        class_level: selectedClass || undefined,
        tuition_type: selectedType || undefined,
      };
      const response = await jobsApi.getJobs(filters, currentPage, 6);
      setJobs(response.results);
      setTotalCount(response.count);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCity, selectedCurriculum, selectedClass, selectedType, currentPage]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('');
    setSelectedCurriculum('');
    setSelectedClass('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCity || selectedCurriculum || selectedClass || selectedType;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              Live Tuition Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
              Find Tuition Jobs
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore live tutoring opportunities posted directly by guardians and students across Bangladesh.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-right self-start md:self-auto shrink-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Live Jobs</span>
            <span className="font-heading text-2xl font-black text-brand-400">{totalCount} Available</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, area, or job title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* City */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">All Cities / Districts</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Curriculum */}
            <div>
              <select
                value={selectedCurriculum}
                onChange={(e) => {
                  setSelectedCurriculum(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">All Mediums</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="English Version">English Version</option>
                <option value="Edexcel">Edexcel (English Medium)</option>
                <option value="Cambridge">Cambridge (English Medium)</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">All Class Levels</option>
                <option value="Class 1 to 5">Class 1 to 5</option>
                <option value="Class 6 to 8">Class 6 to 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10 (SSC)">Class 10 (SSC)</option>
                <option value="HSC (Science)">HSC (Science)</option>
                <option value="HSC (Commerce/Arts)">HSC (Commerce/Arts)</option>
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
                <option value="Admission Prep">Admission Prep</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Filtered results: <strong>{totalCount}</strong> matching posts
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500 rounded-3xl bg-white border border-slate-200">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading live tuition opportunities...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <Filter className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No tuition jobs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try broadening your search or resetting filters to see available tuitions in other locations.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col justify-between hover:border-brand-400 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-navy-950 text-white font-mono text-xs font-bold shadow-xs">
                      {job.job_id}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      {job.curriculum}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {job.title}
                  </h3>

                  <div className="space-y-2 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                      <span className="font-semibold">{job.area}, {job.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{job.class_level} • {job.days_per_week} days/week</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{job.preferred_time || 'Schedule flexible'}</span>
                    </div>
                    {job.subjects?.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[11px] font-semibold text-slate-500">Subjects:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Monthly Remuneration</span>
                    <span className="font-heading text-lg font-black text-slate-900">৳{job.salary.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/job-board/${job.job_id}`}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedJobToApply(job)}
                      className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>

      {/* Quick Apply Modal */}
      {selectedJobToApply && (
        <ApplyJobModal
          job={selectedJobToApply}
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          onSuccess={() => {
            fetchJobs();
          }}
        />
      )}
    </DashboardLayout>
  );
};
