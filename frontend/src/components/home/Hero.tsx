import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle,
  Users,
  Star
} from 'lucide-react';
import { locationsApi } from '../../api/locations';
import type { LocationCity } from '../../api/locations';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectQuery, setSubjectQuery] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await locationsApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    };
    fetchCities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity && selectedCity !== 'All Cities') params.append('city', selectedCity);
    if (selectedClass && selectedClass !== 'All Classes') params.append('class_level', selectedClass);
    if (subjectQuery) params.append('subject', subjectQuery);
    navigate(`/find-tutor?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Search Form */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-300/80 text-brand-900 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Country's #1 Tutor Matching & Learning Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] font-heading">
              Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">Perfect Tutor</span> for Your Child's Success.
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Connect with 48,000+ verified private tutors from <strong>BUET, Dhaka Medical, DU, IBA, NSU</strong> & top institutions. Tailored for Bangla Medium, English Version, and Edexcel/Cambridge curriculums.
            </p>

            {/* Search Card */}
            <form 
              onSubmit={handleSearch}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200/90 space-y-3 max-w-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* City Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    City / District
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <option value="">All Cities</option>
                      {cities.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Class / Grade Level */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Class / Grade
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <option value="">All Classes</option>
                      <option value="Class 1 to 5">Class 1 to 5</option>
                      <option value="Class 6 to 8">Class 6 to 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10 (SSC)">Class 10 (SSC)</option>
                      <option value="HSC">HSC (1st & 2nd Year)</option>
                      <option value="O Level">O Level (Edexcel/Cambridge)</option>
                      <option value="A Level">A Level (Edexcel/Cambridge)</option>
                      <option value="Admission Prep">University Admission</option>
                    </select>
                    <BookOpen className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Subject Search */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject / Topic
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Physics, Math, English"
                      value={subjectQuery}
                      onChange={(e) => setSubjectQuery(e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Submit Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-md hover:shadow-lg active:scale-98"
                >
                  <Search className="w-5 h-5" />
                  Search Qualified Tutors
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/appoint-a-tutor')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm transition-all"
                >
                  Post Tuition Free
                  <ArrowRight className="w-4 h-4 text-brand-400" />
                </button>
              </div>
            </form>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-2">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-500" />
                Free Requirement Posting
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                NID & University Verified Tutors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-500" />
                Free Demo Class Available
              </span>
            </div>

          </div>

          {/* Right Column: Dynamic Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Illustration / Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                  alt="Students learning with qualified tutor"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-md mb-1.5">
                    Live Platform
                  </span>
                  <p className="text-sm font-semibold text-white/90">
                    Trusted by over 35,000+ guardians across Bangladesh.
                  </p>
                </div>
              </div>

              {/* Floating Verified Tutor Card */}
              <div className="absolute -top-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 animate-float">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">BUET / DU / DMC</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Top Mentors Available</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">4.9 / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Floating Job Match Pill */}
              <div className="absolute -bottom-6 -right-4 bg-navy-900 text-white p-3.5 rounded-2xl shadow-xl border border-navy-800 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                  ⚡ 2hr
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Average Matching Time</p>
                  <p className="text-[11px] text-slate-300">Fast tutor CV dispatch</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
