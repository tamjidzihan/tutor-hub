import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tutorsApi } from '../api/tutors';
import type { Tutor } from '../types';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import { 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  Star, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';

export const TutorDetails: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTutor = async () => {
      if (!tutorId) return;
      setIsLoading(true);
      try {
        const found = await tutorsApi.getTutorById(tutorId);
        setTutor(found);
      } finally {
        setIsLoading(false);
      }
    };
    loadTutor();
  }, [tutorId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={1} type="card" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Tutor Profile Not Found"
          description={`We could not find any active tutor profile with identifier "${tutorId}".`}
          actionText="Browse Tutors"
          onAction={() => navigate('/find-tutor')}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/find-tutor"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all verified tutors
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-100">
            
            {/* Avatar with Badge */}
            <div className="relative shrink-0">
              <img
                src={tutor.profile_photo}
                alt={tutor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-brand-50 shadow-md"
              />
              {tutor.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-1.5 rounded-full shadow-lg" title="100% Verified Profile">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                    {tutor.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-navy-950 text-white font-mono text-xs font-bold">
                    {tutor.tutor_id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{tutor.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-slate-500">({tutor.total_reviews} reviews)</span>
                </div>
              </div>

              <p className="text-sm font-bold text-brand-700">
                {tutor.education_level}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {tutor.university} • Department of {tutor.department} (Class of {tutor.graduation_year})
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {tutor.area}, {tutor.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                  {tutor.experience_years}+ Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  Member since {tutor.member_since}
                </span>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium block">Expected Salary:</span>
              <strong className="text-slate-900 text-sm font-heading font-black mt-0.5 block">
                ৳{tutor.expected_salary.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ mo</span>
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium block">Tuition Modality:</span>
              <strong className="text-slate-900 text-xs font-bold mt-0.5 block">
                {tutor.preferred_tuition_type.join(', ')}
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium block">Availability:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available for New Classes
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium block">Verification:</span>
              <span className="inline-flex items-center gap-1 text-brand-700 font-bold text-xs mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                NID & University ID Checked
              </span>
            </div>
          </div>

          {/* Body Sections */}
          <div className="py-6 space-y-8">
            
            {/* Bio */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                About the Tutor
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {tutor.bio}
              </p>
            </div>

            {/* Subjects & Preferred Classes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Subjects Taught
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 font-semibold text-xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Preferred Classes & Mediums
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.preferred_classes.map((cls, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                Preferred Teaching Areas in {tutor.city}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tutor.preferred_locations.map((loc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    <MapPin className="w-3 h-3 text-brand-600" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Education Timeline */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                Educational Qualifications
              </h3>
              <div className="space-y-3">
                {tutor.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-xs text-brand-700 font-semibold">{edu.institution} ({edu.department})</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Passing Year: {edu.passing_year} • Result: {edu.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Section */}
            {tutor.experience.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Teaching Experience
                </h3>
                <div className="space-y-3">
                  {tutor.experience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-900 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{exp.position}</h4>
                        <p className="text-xs text-slate-700 font-semibold">{exp.organization}</p>
                        <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guardian Reviews */}
            {tutor.reviews && tutor.reviews.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Guardian & Student Reviews ({tutor.reviews.length})
                </h3>
                <div className="space-y-3">
                  {tutor.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rev.reviewer_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-slate-400 block">{rev.created_at}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Contact details are kept confidential until trial class confirmation.</span>
            </div>

            <Link
              to={`/appoint-a-tutor?preferred_tutor=${tutor.tutor_id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Request This Tutor (Free Trial)
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
