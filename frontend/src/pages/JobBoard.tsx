import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import type { JobFilterParams } from '../api/jobs';
import type { TuitionJob } from '../types';
import { JobCard } from '../components/jobs/JobCard';
import { JobFilters } from '../components/jobs/JobFilters';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import { Briefcase, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JobBoard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filters State
  const [filters, setFilters] = useState<JobFilterParams>({
    city: searchParams.get('city') || '',
    class_level: searchParams.get('class_level') || '',
    subject: searchParams.get('subject') || '',
    search: searchParams.get('search') || '',
    job_id: searchParams.get('job_id') || '',
    tuition_type: searchParams.get('tuition_type') || '',
    gender: searchParams.get('gender') || 'Any'
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<TuitionJob | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getJobs(filters, currentPage, pageSize);
      setJobs(data.results);
      setTotalCount(data.count);
      setTotalPages(data.total_pages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters: JobFilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const reset = {
      city: '',
      class_level: '',
      subject: '',
      search: '',
      job_id: '',
      tuition_type: '',
      gender: 'Any'
    };
    setFilters(reset);
    setSearchParams({});
    setCurrentPage(1);
  };

  const paginatedJobs = jobs;

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <Briefcase className="w-3.5 h-3.5" />
              Live Tuition Board
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Browse Available Tuition Jobs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Search over 2,450+ verified tuition jobs in Dhaka, Chittagong, Sylhet and major districts. Apply directly and start tutoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-400" />
              Filters ({totalCount})
            </button>

            <Link
              to="/appoint-a-tutor"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Post a Job (Free)
            </Link>
          </div>
        </div>

        {/* Main Content Layout: Filters Sidebar + Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={totalCount}
            />
          </div>

          {/* Mobile Filter Slide-down */}
          {mobileFiltersOpen && (
            <div className="lg:hidden col-span-1 mb-6">
              <JobFilters
                filters={filters}
                onChange={(f) => {
                  handleFilterChange(f);
                  setMobileFiltersOpen(false);
                }}
                onReset={handleResetFilters}
                totalResults={totalCount}
              />
            </div>
          )}

          {/* Jobs Listing Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Active Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-subtle">
              <span className="text-xs font-bold text-slate-600">
                Showing <strong className="text-slate-900">{paginatedJobs.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> results
              </span>
              <span className="text-xs font-semibold text-brand-600">
                Updated in real-time
              </span>
            </div>

            {/* List or Feedback State */}
            {isLoading ? (
              <LoadingSkeleton count={4} type="card" />
            ) : paginatedJobs.length === 0 ? (
              <EmptyState
                title="No Tuition Jobs Found"
                description="We couldn't find any tuition postings matching your current filter criteria. Try clearing some filters or searching for another city."
                actionText="Reset Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={(j) => setSelectedJobToApply(j)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

          </div>

        </div>

      </div>

      {/* Apply Modal */}
      {selectedJobToApply && (
        <ApplyJobModal
          job={selectedJobToApply}
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          onSuccess={() => fetchJobs()}
        />
      )}
    </div>
  );
};
