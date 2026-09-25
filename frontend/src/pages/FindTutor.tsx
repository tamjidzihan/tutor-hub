import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tutorsApi } from '../api/tutors';
import type { TutorFilterParams } from '../api/tutors';
import type { Tutor } from '../types';
import { TutorCard } from '../components/tutor/TutorCard';
import { TutorFilters } from '../components/tutor/TutorFilters';
import { Pagination } from '../components/common/Pagination';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import { SlidersHorizontal, ShieldCheck, GraduationCap } from 'lucide-react';

export const FindTutor: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [filters, setFilters] = useState<TutorFilterParams>({
    city: searchParams.get('city') || '',
    class_level: searchParams.get('class_level') || '',
    subject: searchParams.get('subject') || '',
    search: searchParams.get('search') || '',
    university: searchParams.get('university') || '',
    gender: searchParams.get('gender') || 'Any'
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchTutors = async () => {
    setIsLoading(true);
    try {
      const data = await tutorsApi.getTutors(filters, currentPage, pageSize);
      setTutors(data.results);
      setTotalCount(data.count);
      setTotalPages(data.total_pages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters: TutorFilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const reset = {
      city: '',
      class_level: '',
      subject: '',
      search: '',
      university: '',
      gender: 'Any'
    };
    setFilters(reset);
    setSearchParams({});
    setCurrentPage(1);
  };

  const paginatedTutors = tutors;

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              Verified Tutor Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Find Qualified Tutors Near You
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Browse tutor profiles returned from the TutorHub database and filter by your preferred subject, location, and gender.
            </p>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 self-start"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            Filters ({totalCount})
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <TutorFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={totalCount}
            />
          </div>

          {/* Mobile Filter Slide */}
          {mobileFiltersOpen && (
            <div className="lg:hidden col-span-1 mb-6">
              <TutorFilters
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

          {/* Tutors Listing Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Top Results Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-subtle">
              <span className="text-xs font-bold text-slate-600">
                Showing <strong className="text-slate-900">{paginatedTutors.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> verified tutors
              </span>
              <div className="flex items-center gap-1 text-xs text-brand-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified profiles</span>
              </div>
            </div>

            {/* Content or Feedback States */}
            {isLoading ? (
              <LoadingSkeleton count={4} type="card" />
            ) : paginatedTutors.length === 0 ? (
              <EmptyState
                title="No Tutors Found"
                description="No tutors matched your selected filters. Try searching for another subject or resetting filters."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
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
    </div>
  );
};
