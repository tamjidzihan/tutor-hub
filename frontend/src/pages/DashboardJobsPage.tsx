import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { jobsApi, type JobFilterParams } from '../api/jobs';
import { applicationsApi } from '../api/applications';
import { locationsApi, type LocationCity } from '../api/locations';
import type { JobApplication, TuitionJob } from '../types';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal';
import { Pagination } from '../components/common/Pagination';
import { AdminResourceManagement } from '../components/dashboard/AdminResourceManagement';
import {
  Search,
  MapPin,
  GraduationCap,
  Layers,
  Filter,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';

type JobEditForm = Partial<TuitionJob> & {
  requirements_text?: string;
  tutoring_time?: string;
  preferred_time?: string;
};

export const DashboardJobsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filteredJobs, setFilteredJobs] = useState<TuitionJob[]>([]);
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
  const [editingJob, setEditingJob] = useState<TuitionJob | null>(null);
  const [editForm, setEditForm] = useState<JobEditForm>({});
  const [jobApplications, setJobApplications] = useState<Record<string, JobApplication[]>>({});

  const openEditJob = (job: TuitionJob) => {
    const jobData = job as any;
    setEditingJob(job);
    setEditForm({
      title: job.title,
      city: job.city,
      area: job.area,
      curriculum: job.curriculum,
      class_level: job.class_level,
      subjects: job.subjects,
      preferred_tutor_gender: job.preferred_tutor_gender,
      days_per_week: job.days_per_week,
      tuition_type: job.tuition_type,
      tutoring_time: jobData.tutoring_time ?? job.preferred_time ?? '',
      salary: job.salary,
      requirements_text: jobData.requirements_text ?? jobData.description ?? '',
    });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    const payload = {
      title: editForm.title,
      city: editForm.city,
      area: editForm.area,
      curriculum: editForm.curriculum,
      class_level: editForm.class_level,
      subjects: Array.isArray(editForm.subjects)
        ? editForm.subjects
        : String(editForm.subjects || '').split(',').map((item) => item.trim()).filter(Boolean),
      preferred_tutor_gender: editForm.preferred_tutor_gender,
      days_per_week: Number(editForm.days_per_week || 0),
      tuition_type: editForm.tuition_type,
      tutoring_time: editForm.tutoring_time ?? editForm.preferred_time ?? '',
      salary: Number(editForm.salary || 0),
      requirements_text: editForm.requirements_text ?? '',
    };

    try {
      await jobsApi.updateJob(editingJob.job_id, payload);
      setEditingJob(null);
      setEditForm({});
      fetchJobs();
    } catch (err) {
      console.error('Failed to update job:', err);
      window.alert('Unable to update this job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = window.confirm('Delete this tuition job? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await jobsApi.deleteJob(jobId);
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
      window.alert('Unable to delete this job. Please try again.');
    }
  };

  useEffect(() => {
    if (!user || user.role === 'ADMIN') return;
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
    if (!user || !isAuthenticated || user.role === 'ADMIN') return;
    setLoading(true);
    try {
      const filters: JobFilterParams = {
        search: search || undefined,
        city: selectedCity || undefined,
        curriculum: selectedCurriculum || undefined,
        class_level: selectedClass || undefined,
        tuition_type: selectedType || undefined,
      };
      const response = await jobsApi.getJobs(filters, currentPage, user?.role === 'TUTOR' ? 6 : 100);
      let allResults = response.results;
      if (user?.role !== 'TUTOR' && response.total_pages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: response.total_pages - 1 }, (_, index) =>
            jobsApi.getJobs(filters, index + 2, 100)
          )
        );
        allResults = allResults.concat(...remainingPages.flatMap((page) => page.results));
      }
      const myJobs = user?.role !== 'TUTOR' ? allResults.filter((j: any) => j.student === user?.id) : allResults;
      setFilteredJobs(myJobs);
      setTotalCount(user?.role !== 'TUTOR' ? myJobs.length : response.count);
      setTotalPages(user?.role !== 'TUTOR' ? 1 : response.total_pages);

      if (user?.role !== 'TUTOR') {
        const appMap: Record<string, JobApplication[]> = {};
        await Promise.all(myJobs.map(async (job) => {
          try {
            const apps = await applicationsApi.getApplicationsForJob(job.job_id);
            appMap[job.job_id] = apps;
          } catch {
            appMap[job.job_id] = [];
          }
        }));
        setJobApplications(appMap);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role === 'ADMIN') return;
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCity, selectedCurriculum, selectedClass, selectedType, currentPage]);

  useEffect(() => {
    if (!user || user.role === 'ADMIN') return;
    const targetJobId = searchParams.get('job_id');
    if (!targetJobId) return;

    navigate(`/dashboard/jobs/${targetJobId}/applications`, { replace: true });
  }, [navigate, searchParams]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return (
      <DashboardLayout>
        <AdminResourceManagement
          resource="jobs"
          title="Tuition Jobs Moderation"
          subtitle="Moderate parent-posted tuition jobs, review academic requirements, and inspect applicant submissions."
        />
      </DashboardLayout>
    );
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
  const getApplicationCounts = (jobId: string) => {
    const applications = jobApplications[jobId] || [];
    return {
      total: applications.length,
      new: applications.filter((application) => !application.seen_by_student).length,
    };
  };

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
              {user?.role === 'TUTOR' ? 'Find Tuition Jobs' : 'My Posted Jobs'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.role === 'TUTOR'
                ? 'Explore live tutoring opportunities posted directly by guardians and students across Bangladesh.'
                : 'Manage tuition jobs you have posted and review tutor applications.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-right self-start md:self-auto shrink-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Live Jobs</span>
            <span className="font-heading text-2xl font-black text-brand-400">{user?.role === 'TUTOR' ? totalCount + ' Available' : totalCount + ' Posted'}</span>
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
        ) : filteredJobs.length === 0 ? (
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
          <div className={user.role === 'TUTOR' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                id={`job-${job.job_id}`}
                className={user.role === 'TUTOR'
                  ? 'bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col justify-between hover:border-brand-400 hover:shadow-lg transition-all'
                  : 'group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-brand-300 hover:shadow-lg sm:p-6 md:flex md:items-center md:gap-6'}
              >
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-navy-950 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-xs">
                      {job.job_id}
                    </span>
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      {job.curriculum}
                    </span>
                    {user.role !== 'TUTOR' && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {job.status}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                    {job.title}
                  </h3>

                  <div className={user.role === 'TUTOR'
                    ? 'space-y-2 pt-1 text-xs text-slate-600'
                    : 'flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs text-slate-600'}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                      <span className="font-semibold">{job.area}, {job.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{job.class_level} • {job.days_per_week} days/week</span>
                    </div>
                    <div className="flex items-center gap-2">
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

                <div className={user.role === 'TUTOR'
                  ? 'mt-5 flex items-center justify-between border-t border-slate-100 pt-4'
                  : 'mt-5 grid grid-cols-2 items-center gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-5 md:mt-0 md:w-auto md:shrink-0 md:grid-cols-[auto_auto_auto] md:gap-3 md:border-l md:border-t-0 md:pl-6 md:pt-0'}>
                  <div className={user.role === 'TUTOR' ? '' : 'min-w-0'}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Monthly Remuneration</span>
                    <span className="font-heading text-lg font-black text-slate-900">৳{job.salary.toLocaleString()}</span>
                  </div>

                    {user.role !== 'TUTOR' && (
                      <Link
                        to={`/dashboard/jobs/${job.job_id}/applications`}
                        aria-label={`${getApplicationCounts(job.job_id).total} applications${getApplicationCounts(job.job_id).new > 0 ? `, ${getApplicationCounts(job.job_id).new} new` : ''}`}
                        className="relative flex min-h-[68px] min-w-[118px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition-all hover:border-brand-300 hover:bg-brand-50 sm:min-w-[140px]"
                      >
                        <span className="text-left">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Applications</span>
                          <span className="mt-0.5 block text-xl font-black leading-none text-slate-900">
                            {getApplicationCounts(job.job_id).total}
                          </span>
                        </span>
                        {getApplicationCounts(job.job_id).new > 0 && (
                          <span className="relative mr-1 flex h-3 w-3 shrink-0" aria-label={`${getApplicationCounts(job.job_id).new} new applications`}>
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
                          </span>
                        )}
                      </Link>
                    )}
                  <div className={user.role === 'TUTOR' ? 'flex items-center gap-2' : 'col-span-2 flex items-center justify-end gap-2 sm:col-span-1'}>
                    <Link
                      to={`/job-board/${job.job_id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Details
                    </Link>
                    {user?.role !== 'TUTOR' && job.student === user?.id && (
                      <>
                        <button
                          type="button"
                          aria-label="Edit job"
                          title="Edit job"
                          onClick={() => openEditJob(job)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete job"
                          title="Delete job"
                          onClick={() => handleDeleteJob(job.job_id)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {user?.role === 'TUTOR' && (
                      <button
                        type="button"
                        onClick={() => setSelectedJobToApply(job)}
                        className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Apply Now
                      </button>
                    )}
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

      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">Update Job</p>
                <h3 className="text-xl font-black text-slate-900">Edit tuition listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                Title
                <input
                  value={editForm.title ?? ''}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                City
                <input
                  value={editForm.city ?? ''}
                  onChange={(e) => handleEditChange('city', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Area
                <input
                  value={editForm.area ?? ''}
                  onChange={(e) => handleEditChange('area', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Curriculum
                <select
                  value={editForm.curriculum ?? ''}
                  onChange={(e) => handleEditChange('curriculum', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                >
                  <option value="">Select</option>
                  <option value="Bangla Medium">Bangla Medium</option>
                  <option value="English Version">English Version</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="Cambridge">Cambridge</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Class Level
                <input
                  value={editForm.class_level ?? ''}
                  onChange={(e) => handleEditChange('class_level', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Preferred Tutor Gender
                <select
                  value={editForm.preferred_tutor_gender ?? 'Any'}
                  onChange={(e) => handleEditChange('preferred_tutor_gender', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Tuition Type
                <select
                  value={editForm.tuition_type ?? 'Home Tutoring'}
                  onChange={(e) => handleEditChange('tuition_type', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                >
                  <option value="Home Tutoring">Home Tutoring</option>
                  <option value="Online Tutoring">Online Tutoring</option>
                  <option value="Group/Batch">Group/Batch</option>
                  <option value="Crash Course">Crash Course</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Days / Week
                <input
                  type="number"
                  min={1}
                  value={editForm.days_per_week ?? 0}
                  onChange={(e) => handleEditChange('days_per_week', Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Salary (BDT)
                <input
                  type="number"
                  min={0}
                  value={editForm.salary ?? 0}
                  onChange={(e) => handleEditChange('salary', Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                Schedule
                <input
                  value={editForm.tutoring_time ?? editForm.preferred_time ?? ''}
                  onChange={(e) => handleEditChange('tutoring_time', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="Example: 5:00 PM - 7:00 PM"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                Subjects
                <input
                  value={Array.isArray(editForm.subjects) ? editForm.subjects.join(', ') : ''}
                  onChange={(e) => handleEditChange('subjects', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="Math, Physics, Chemistry"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                Requirements / Notes
                <textarea
                  rows={4}
                  value={editForm.requirements_text ?? ''}
                  onChange={(e) => handleEditChange('requirements_text', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateJob}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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
