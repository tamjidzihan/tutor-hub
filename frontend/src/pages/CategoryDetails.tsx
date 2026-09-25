import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import { tutorsApi } from '../api/tutors';
import type { ServiceCategory, Tutor } from '../types';
import { TutorCard } from '../components/tutor/TutorCard';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const CategoryDetails: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);
      try {
        const found = await categoriesApi.getCategoryBySlug(slug || id || '');
        setCategory(found);
        if (found) {
          const tutorRes = await tutorsApi.getTutors();
          setTutors(tutorRes.results.slice(0, 4));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCategoryData();
  }, [id, slug]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Category Not Found"
          description="The requested tuition category is currently not available."
          actionText="Explore All Categories"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>

        {/* Hero Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-navy-950 text-white shadow-2xl">
          <div className="absolute inset-0">
            {category.image || category.hero_image ? <img src={category.image || category.hero_image} alt={category.title || category.name} className="h-full w-full object-cover opacity-25" /> : <div className="h-full w-full bg-navy-950" />}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 space-y-4 max-w-2xl">
            <span className="px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold">
              {category.subtitle || 'Expert Home & Online Tutors'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
              {category.title || category.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {category.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to={`/appoint-a-tutor?category=${category.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <span>Request Tutor for this Category</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <span className="inline-flex items-center gap-1.5 text-xs text-brand-300 font-semibold bg-brand-950/70 px-3 py-2 rounded-lg border border-brand-800">
                <Users className="w-4 h-4" />
                {(category.tutors_count ?? category.tutor_count ?? 0).toLocaleString()} Available Tutors
              </span>
            </div>
          </div>
        </div>

        {/* Learning Topics & Popular Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-card">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              What Students Will Learn
            </h3>
            <div className="space-y-3">
              {(category.learning_topics || category.features || []).length === 0 ? <p className="text-sm text-slate-500">Course details will be added for this category soon.</p> : (category.learning_topics || category.features || []).map((topic, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-card">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Courses in this Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {!category.subcategories?.length ? <p className="text-sm text-slate-500">No courses are available in this category yet.</p> : category.subcategories.map((course) => (
                <Link key={course.id} to={`/find-tutor?search=${encodeURIComponent(course.name)}`} className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50">
                  <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800 group-hover:text-brand-700"><span>{course.name}</span><ArrowRight className="h-4 w-4 shrink-0" /></span>
                  {course.description && <span className="mt-1 block text-xs leading-relaxed text-slate-500">{course.description}</span>}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Free personalized learning roadmap provided with every assigned mentor.</span>
            </div>
          </div>

        </div>

        {/* Featured Tutors in this Category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Top Rated Instructors in {category.title || category.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified university mentors with proven student grade improvements.
              </p>
            </div>

            <Link
              to="/find-tutor"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Browse All Tutors →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.slice(0, 3).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
