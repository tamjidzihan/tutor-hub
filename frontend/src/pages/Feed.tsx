import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postsApi } from '../api/posts';
import type { Post, PostCategory } from '../types';
import {
  MessageSquare, Heart, Sparkles, Send, Trash2,
  Flag, Search, Tag, AlertCircle
} from 'lucide-react';
import { Button } from '../components/common/Button';

const CATEGORIES: { id: PostCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Topics' },
  { id: 'ACADEMIC', label: 'Academic Discussion' },
  { id: 'TIPS', label: 'Study Tips & Strategies' },
  { id: 'QUESTION', label: 'Questions & Help' },
  { id: 'RESOURCE', label: 'Resources & Books' },
  { id: 'EXPERIENCE', label: 'Tutor Experience' },
];

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [isForYou, setIsForYou] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Post Form State
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<PostCategory>('ACADEMIC');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Comment Thread
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  // Report Modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const data = await postsApi.getPosts({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        for_you: isForYou,
      });
      setPosts(data);
    } catch {
      showToast('Could not load community feed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedCategory, isForYou]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeed();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const created = await postsApi.createPost({
        content: newContent.trim(),
        category: newCategory,
        tags,
      });

      setPosts((prev) => [created, ...prev]);
      setNewContent('');
      setNewTags('');
      showToast('Post published to the community!', 'success');
    } catch {
      showToast('Failed to publish post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await postsApi.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: res.is_liked, likes_count: res.likes_count }
            : p
        )
      );
    } catch {
      showToast('Action could not be completed.', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Post deleted.', 'info');
    } catch {
      showToast('Unable to delete post.', 'error');
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentText[postId] || '').trim();
    if (!text) return;

    setIsCommentSubmitting(true);
    try {
      const comment = await postsApi.addComment(postId, text);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const existingComments = p.comments || [];
            return {
              ...p,
              comments_count: p.comments_count + 1,
              comments: [...existingComments, comment],
            };
          }
          return p;
        })
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch {
      showToast('Failed to post comment.', 'error');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportingPostId || !reportReason.trim()) return;
    try {
      await postsApi.reportPost(reportingPostId, reportReason.trim());
      showToast('Report submitted for moderation. Thank you.', 'success');
      setReportingPostId(null);
      setReportReason('');
    } catch {
      showToast('Failed to submit report.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Community & Knowledge Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Education & Tutor Feed
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ask questions, exchange study strategies, and discover verified academic guidance.
            </p>
          </div>

          {/* AI "For You" Feed Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIsForYou(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !isForYou
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latest Posts
            </button>
            <button
              type="button"
              onClick={() => setIsForYou(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isForYou
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI For You
            </button>
          </div>
        </div>

        {/* Create Post Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.first_name?.[0] || 'U'
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.full_name || user?.email}</p>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {user?.role === 'TUTOR' ? 'Verified Tutor' : user?.role === 'STUDENT' ? 'Student' : 'Administrator'}
              </span>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share an academic tip, ask a subject question, or post a learning resource..."
              className="w-full text-sm rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 resize-none"
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as PostCategory)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-brand-500"
                >
                  <option value="ACADEMIC">Academic Discussion</option>
                  <option value="TIPS">Study Tips & Tricks</option>
                  <option value="QUESTION">Student Question</option>
                  <option value="RESOURCE">Learning Resource</option>
                  <option value="EXPERIENCE">Tutor Experience</option>
                </select>

                <div className="relative">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Tags (e.g. math, physics)"
                    className="text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 outline-none focus:border-brand-500 w-44"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="rounded-xl px-5 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Post Update
              </Button>
            </div>
          </form>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by topic, subject, or author name..."
              className="w-full text-xs pl-10 pr-24 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-xl hover:bg-brand-100 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Posts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                    <div className="w-20 h-2.5 bg-slate-200 rounded-md" />
                  </div>
                </div>
                <div className="h-16 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No community posts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to share an educational tip, question, or study resource in this category!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isCommentsOpen = openCommentsPostId === post.id;
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden">
                        {post.author_avatar ? (
                          <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          post.author_name?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{post.author_name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              post.author_role === 'TUTOR'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                                : post.author_role === 'ADMIN'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {post.author_role === 'TUTOR' ? 'Tutor' : post.author_role === 'ADMIN' ? 'Admin' : 'Student'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{post.formatted_time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {post.category_label || post.category}
                      </span>
                      {post.is_mine && (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setReportingPostId(post.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                        title="Report inappropriate content"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Recommendation Badge */}
                  {post.is_recommended && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      Recommended for your learning interests
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-brand-600 bg-brand-50/60 px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition-colors ${
                          post.is_liked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                        className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count} Comments</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Thread (Expanded) */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {post.comments.map((c) => (
                            <div key={c.id} className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{c.author_name}</span>
                                <span className="text-[10px] text-slate-400">{c.formatted_time}</span>
                              </div>
                              <p className="text-slate-700">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText[post.id] || ''}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Write a helpful reply..."
                          className="flex-1 text-xs rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          disabled={isCommentSubmitting || !(commentText[post.id] || '').trim()}
                          onClick={() => handleAddComment(post.id)}
                          className="px-3.5 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 disabled:opacity-50 transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Report Modal */}
        {reportingPostId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Report Inappropriate Post</h3>
              </div>
              <p className="text-xs text-slate-500">
                Please explain why this content violates community or educational guidelines:
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Spam, misinformation, inappropriate language, etc."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 outline-none focus:border-amber-500 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReportingPostId(null);
                    setReportReason('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
