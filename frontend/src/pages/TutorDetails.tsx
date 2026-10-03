import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tutorsApi } from '../api/tutors';
import { reviewsApi } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Tutor, TutorReviewsOverview } from '../types';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import {
  GraduationCap,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Send
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const TutorDetails: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [reviewsData, setReviewsData] = useState<TutorReviewsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review Form State
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [classInput, setClassInput] = useState<string>('Class 10');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleMessageTutor = () => {
    if (!tutor) return;
    const tutorIdentifier = tutor.tutor_id || tutor.id;
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: `/dashboard/messages?tutor=${tutorIdentifier}`,
          message: `Please sign in to message ${tutor.name}.`
        }
      });
      return;
    }
    navigate(`/dashboard/messages?tutor=${tutorIdentifier}`);
  };

  useEffect(() => {
    const loadTutorAndReviews = async () => {
      if (!tutorId) return;
      setIsLoading(true);
      try {
        const found = await tutorsApi.getTutorById(tutorId);
        setTutor(found);

        // Fetch live reviews overview with AI insights
        try {
          const revOverview = await reviewsApi.getTutorReviews(tutorId);
          setReviewsData(revOverview);
        } catch {
          // Soft fail
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTutorAndReviews();
  }, [tutorId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor || !commentInput.trim()) return;

    setIsSubmittingReview(true);
    try {
      await reviewsApi.submitReview({
        tutor: tutor.id,
        rating: ratingInput,
        comment: commentInput.trim(),
        student_class: classInput.trim(),
      });
      showToast('Thank you! Your review has been recorded.', 'success');
      setCommentInput('');

      // Reload reviews
      const updatedRev = await reviewsApi.getTutorReviews(tutor.tutor_id);
      setReviewsData(updatedRev);
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to submit review. You cannot review your own profile.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  const rating = Number(tutor.rating);
  const expectedSalary = Number(tutor.expected_salary);
  const isOwnProfile = user?.email && tutor.name && user.full_name?.toLowerCase() === tutor.name.toLowerCase();

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
              {tutor.profile_photo ? (
                <img
                  src={tutor.profile_photo}
                  alt={tutor.name}
                  className="h-24 w-24 rounded-3xl object-cover ring-4 ring-brand-50 shadow-md sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-100 text-3xl font-bold text-brand-700 ring-4 ring-brand-50 shadow-md sm:h-28 sm:w-28">
                  {tutor.name?.[0] || '?'}
                </div>
              )}
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
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-900">
                    {rating > 0 ? rating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">
                    ({reviewsData?.total_reviews || tutor.total_reviews} reviews)
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-brand-700">
                {tutor.education_level || 'B.Sc Engineering'} in {tutor.department} — {tutor.university}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {tutor.area}, {tutor.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {tutor.experience_years} Years Tutoring Experience
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {tutor.member_since?.split('-')?.[0] || '2024'}
                </span>
              </div>
            </div>

            {/* Direct Message Tutor CTA Button */}
            {!isOwnProfile && (
              <div className="shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleMessageTutor}
                  className="w-full md:w-auto px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Tutor
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Expected Salary</span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-heading">
                ৳{expectedSalary.toLocaleString()}/mo
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Profile Score</span>
              <span className="text-base sm:text-lg font-black text-brand-600 font-heading">
                {tutor.profile_completion}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Gender</span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-heading">
                {tutor.gender === 'FEMALE' ? 'Female' : 'Male'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Status</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 font-heading">
                {tutor.is_available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="py-6 space-y-8">

            {/* About / Bio */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">About the Tutor</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {tutor.bio || 'Dedicated academic tutor focusing on building deep conceptual clarity, problem-solving skills, and disciplined exam strategy.'}
              </p>
            </div>

            {/* Subjects & Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Subjects Taught</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 font-bold text-xs border border-brand-100">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Target Classes & Curriculums</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.preferred_classes.map((cls, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Preferred Teaching Areas in {tutor.city}</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.preferred_locations.map((loc, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    <MapPin className="w-3 h-3 text-brand-600" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Education Timeline */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Educational Qualifications</h3>
              <div className="space-y-3">
                {tutor.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
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

            {/* AI Review Insights & Ratings Breakdown Section */}
            <div className="pt-6 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    Student Reviews & Evaluation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent, verified feedback analyzed with Gemini AI evaluation.
                  </p>
                </div>
              </div>

              {/* AI Insights Card */}
              {reviewsData?.ai_insights && (
                <div className="bg-gradient-to-r from-brand-50/70 to-indigo-50/70 rounded-3xl p-5 sm:p-6 border border-brand-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-brand-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    AI Review Evaluation & Highlights
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {reviewsData.ai_insights.overall_summary}
                  </p>
                  {reviewsData.ai_insights.highlight_points?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {reviewsData.ai_insights.highlight_points.map((pt, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-brand-800 text-xs font-bold border border-brand-200/80 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-brand-500" />
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rating Summary & Distribution Bars */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center md:border-r md:border-slate-200 pr-0 md:pr-4">
                  <span className="text-4xl font-black text-slate-900 font-heading">
                    {reviewsData ? reviewsData.overall_rating.toFixed(1) : rating.toFixed(1)}
                  </span>
                  <div className="flex justify-center text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Based on {reviewsData?.total_reviews || 0} student ratings
                  </p>
                </div>

                <div className="md:col-span-8 space-y-2 text-xs font-semibold text-slate-600">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = reviewsData?.rating_distribution_percentages?.[star] || 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-8 shrink-0">{star} ★</span>
                        <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-500 text-[11px]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write a Review Form (For Students) */}
              {!isOwnProfile && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Rate & Review this Tutor</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">Your Rating:</span>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-5 h-5 ${ratingInput >= star ? 'fill-current text-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{ratingInput} of 5 Stars</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Your Academic Class</label>
                        <input
                          type="text"
                          value={classInput}
                          onChange={(e) => setClassInput(e.target.value)}
                          placeholder="e.g. Class 10 (SSC)"
                          className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 outline-none focus:border-brand-500"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Written Review</label>
                        <textarea
                          rows={2}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Explain how this tutor helped your conceptual understanding, problem-solving, and consistency..."
                          className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 outline-none focus:border-brand-500 resize-none"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmittingReview}
                      className="rounded-xl px-5 py-2 text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-3">
                {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                  reviewsData.reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rev.student_name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">• {rev.student_class}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                        {rev.ai_sentiment && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.ai_sentiment.toLowerCase().includes('positive')
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rev.ai_sentiment} Sentiment
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No student reviews recorded yet. Be the first to review this tutor!
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Direct communication enabled between students and verified tutors.</span>
            </div>

            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => navigate(`/messages?tutor=${tutor.tutor_id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                Message Tutor Directly
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
