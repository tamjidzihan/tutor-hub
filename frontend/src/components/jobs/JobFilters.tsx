import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Search, MapPin } from 'lucide-react';
import { locationsApi, type LocationCity } from '../../api/locations';
import type { JobFilterParams } from '../../api/jobs';

interface JobFiltersProps {
  filters: JobFilterParams;
  onChange: (newFilters: JobFilterParams) => void;
  onReset: () => void;
  totalResults: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults
}) => {
  const [cities, setCities] = useState<LocationCity[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await locationsApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities for job filters:', err);
      }
    };
    fetchCities();
  }, []);

  const currentCityObj = cities.find(c => c.name === filters.city);
  const areas = currentCityObj ? currentCityObj.areas : [];

  const handleFieldChange = (key: keyof JobFilterParams, value: any) => {
    if (key === 'city') {
      onChange({ ...filters, city: value, area: '' });
    } else {
      onChange({ ...filters, [key]: value });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-6">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="text-base font-bold text-slate-900">Filter Jobs</h3>
        </div>
        
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Search by Job ID or Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Job ID / Keyword
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. TT-J-004814 or Physics"
            value={filters.search || ''}
            onChange={(e) => handleFieldChange('search', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* City Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Select City
        </label>
        <div className="relative">
          <select
            value={filters.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Area Filter (Conditional on City) */}
      {areas.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Select Area in {filters.city}
          </label>
          <select
            value={filters.area || ''}
            onChange={(e) => handleFieldChange('area', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Areas in {filters.city}</option>
            {areas.map((a) => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Class / Grade Level */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Class / Grade
        </label>
        <select
          value={filters.class_level || ''}
          onChange={(e) => handleFieldChange('class_level', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">All Classes</option>
          <option value="Class 1 to 5">Class 1 to 5</option>
          <option value="Class 6 to 8">Class 6 to 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10 (SSC)">Class 10 (SSC)</option>
          <option value="HSC">HSC (Science/Commerce/Arts)</option>
          <option value="O Level">O Level (Edexcel/Cambridge)</option>
          <option value="A Level">A Level (Edexcel/Cambridge)</option>
          <option value="Admission Prep">University Admission</option>
        </select>
      </div>

      {/* Tuition Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Tuition Type
        </label>
        <select
          value={filters.tuition_type || ''}
          onChange={(e) => handleFieldChange('tuition_type', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">All Types</option>
          <option value="Home Tutoring">Home Tutoring</option>
          <option value="Online">Online Tutoring</option>
          <option value="Batch">Group / Batch</option>
          <option value="Crash Course">Crash Course</option>
        </select>
      </div>

      {/* Preferred Tutor Gender */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Tutor Gender
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['Any', 'Male', 'Female'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleFieldChange('gender', g)}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                (filters.gender || 'Any') === g
                  ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="pt-2">
        <div className="p-3 bg-brand-50 rounded-xl border border-brand-200/80 text-center">
          <p className="text-xs font-bold text-brand-900">
            {totalResults} {totalResults === 1 ? 'Job' : 'Jobs'} Available
          </p>
        </div>
      </div>

    </div>
  );
};
