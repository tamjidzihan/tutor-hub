import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  Globe, 
  Award, 
  Languages, 
  Code, 
  Palette, 
  Sparkles, 
  ArrowRight,
  Users
} from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import type { ServiceCategory } from '../../types';
import { LoadingSkeleton } from '../common/FeedbackStates';

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Cpu: <Code className="w-6 h-6" />
};

export const ServiceCategories: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Service Categories
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
              Tuition Categories We Offer
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
              Explore specialized tutoring across academic mediums, language courses, admission coaching, and in-demand technical skills.
            </p>
          </div>

          <Link
            to="/find-tutor"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            See All Categories & Tutors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <LoadingSkeleton count={4} type="card" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {category.is_popular && (
                  <div className="absolute top-0 right-0">
                    <span className="bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                    {(category.icon_name && iconMap[category.icon_name]) || (category.iconName && iconMap[category.iconName]) || <BookOpen className="w-6 h-6" />}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2 font-heading">
                    {category.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {category.tutor_count?.toLocaleString() || '1,000+'} Tutors
                  </span>

                  <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
