import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/content';
import type { BlogPost } from '../types';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/FeedbackStates';

export const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await contentApi.getBlogs();
        setBlogs(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            TutorHub Academic Journal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            Study Guides, Exam Strategies & Parenting Tips
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Curated articles from Bangladesh's top board rankers and educational mentors to supercharge student learning.
          </p>
        </div>

        {/* Blog Cards Grid */}
        {isLoading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post) => {
              const authorName = typeof post.author === 'object' ? post.author?.name : (post.author || 'TutorHub Academic Team');
              const authorAvatar = typeof post.author === 'object' ? post.author?.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden bg-slate-100">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="text-brand-600 font-bold uppercase">{post.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.read_time}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {post.excerpt || post.summary || ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold">{authorName}</span>
                    </div>
                    <span className="font-bold text-brand-600 flex items-center gap-1">
                      Read Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
