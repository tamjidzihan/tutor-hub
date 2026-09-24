import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content';
import type { BlogPost } from '../types';
import { EmptyState, LoadingSkeleton } from '../components/common/FeedbackStates';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';

export const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const found = await contentApi.getBlogBySlug(slug);
        setPost(found);
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton count={1} type="card" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Article Not Found"
          description="The requested blog post could not be located."
          actionText="Back to Blog"
          onAction={() => navigate('/blog')}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-12 space-y-8">
          
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author Meta */}
            {(() => {
              const authorName = typeof post.author === 'object' ? post.author?.name : (post.author || 'TutorHub Academic Team');
              const authorRole = typeof post.author === 'object' ? post.author?.role : (post.author_role || 'Senior Education Analyst');
              const authorAvatar = typeof post.author === 'object' ? post.author?.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

              return (
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 flex-wrap gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{authorName}</p>
                      <p className="text-[11px] text-brand-600 font-semibold">{authorRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.published_at || post.created_at || 'Recent'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.read_time}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Cover Image */}
          <div className="rounded-2xl overflow-hidden max-h-96 shadow-md">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body Content */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            {(post.tags || ['Education', 'Tuition', 'Study Tips']).map((t, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                #{t}
              </span>
            ))}
          </div>

        </article>

      </div>
    </div>
  );
};
