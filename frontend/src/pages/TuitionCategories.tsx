import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import { categoriesApi } from '../api/categories';
import type { ServiceCategory } from '../types';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';

export const TuitionCategories: React.FC = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        categoriesApi.getCategories().then(setCategories).catch(() => setError(true)).finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-10 lg:py-14">
            <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-8 text-white shadow-xl sm:p-12">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300"><GraduationCap className="h-3.5 w-3.5" />Tuition Categories</div>
                    <h1 className="font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">Choose a learning category</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Explore courses and tutor options organized by the category you want to learn.</p>
                </div>

                {loading ? <LoadingSkeleton count={6} type="card" /> : error ? <EmptyState title="Unable to load categories" description="Please try again in a moment." actionText="Try Again" onAction={() => window.location.reload()} /> : categories.length === 0 ? <EmptyState title="No tuition categories yet" description="Categories will appear here when they are added." /> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.id} to={`/category-details/${category.slug}`} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"><div><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-200/60 bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white"><BookOpen className="h-6 w-6" /></div><h2 className="font-heading text-xl font-bold text-slate-900 group-hover:text-brand-600">{category.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{category.description}</p></div><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Users className="h-3.5 w-3.5" />{(category.tutor_count ?? 0).toLocaleString()} tutors</span><span className="flex items-center gap-1 text-xs font-bold text-brand-600">View Courses <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></div></Link>)}</div>}
            </div>
        </div>
    );
};
