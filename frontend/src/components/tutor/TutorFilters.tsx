import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { locationsApi, type LocationCity } from '../../api/locations';
import type { TutorFilterParams } from '../../api/tutors';

interface TutorFiltersProps {
  filters: TutorFilterParams;
  onChange: (newFilters: TutorFilterParams) => void;
  onReset: () => void;
  totalResults: number;
}

export const TutorFilters: React.FC<TutorFiltersProps> = ({
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
        console.error('Failed to load cities for tutor filters:', err);
      }
    };
    fetchCities();
  }, []);

  const currentCityObj = cities.find(c => c.name === filters.city);
  const areas = currentCityObj ? currentCityObj.areas : [];

  const handleFieldChange = (key: keyof TutorFilterParams, value: any) => {
    if (key === 'city') {
      onChange({ ...filters, city: value, area: '' });
    } else {
      onChange({ ...filters, [key]: value });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="text-base font-bold text-slate-900">Filter Tutors</h3>
        </div>
        
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Name / Keyword Search */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Search by Name / University
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Tamzid, BUET, Physics"
            value={filters.search || ''}
            onChange={(e) => handleFieldChange('search', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          City
        </label>
        <select
          value={filters.city || ''}
          onChange={(e) => handleFieldChange('city', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Area */}
      {areas.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Area in {filters.city}
          </label>
          <select
            value={filters.area || ''}
            onChange={(e) => handleFieldChange('area', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Gender */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Tutor Gender
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['Any', 'MALE', 'FEMALE'].map((g) => (
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
              {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* University Background */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          University Background
        </label>
        <select
          value={filters.university || ''}
          onChange={(e) => handleFieldChange('university', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">All Universities</option>
          <option value="BUET">BUET</option>
          <option value="Medical">Dhaka Medical College (DMC)</option>
          <option value="University of Dhaka">University of Dhaka (DU)</option>
          <option value="IBA">IBA, DU</option>
          <option value="CUET">CUET</option>
          <option value="SUST">SUST</option>
          <option value="NSU">North South University (NSU)</option>
          <option value="BRAC">BRAC University</option>
        </select>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Subject
        </label>
        <select
          value={filters.subject || ''}
          onChange={(e) => handleFieldChange('subject', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">All Subjects</option>
          <option value="Physics">Physics</option>
          <option value="Higher Math">Higher Math</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="General Math">General Math</option>
          <option value="English">English</option>
          <option value="ICT">ICT</option>
          <option value="Accounting">Accounting</option>
          <option value="Economics">Economics</option>
          <option value="Pure Math">Pure Math (O/A Level)</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="p-3 bg-brand-50 rounded-xl border border-brand-200/80 text-center">
        <p className="text-xs font-bold text-brand-900">
          {totalResults} Verified {totalResults === 1 ? 'Tutor' : 'Tutors'} Found
        </p>
      </div>

    </div>
  );
};
