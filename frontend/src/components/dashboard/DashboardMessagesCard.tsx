import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Clock, User as UserIcon } from 'lucide-react';
import { messagingApi } from '../../api/messaging';
import type { Conversation } from '../../types';

export const DashboardMessagesCard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchConvs = async () => {
      try {
        const data = await messagingApi.getConversations();
        if (isMounted) {
          setConversations(data);
        }
      } catch {
        // Soft fail
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchConvs();
    const interval = setInterval(fetchConvs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const recentConversations = conversations.slice(0, 4);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/60">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-black text-slate-900">
                Messages & Conversations
              </h3>
              {totalUnread > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                  {totalUnread} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Direct communications with students and tutors
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/messages"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
        >
          View All Messages
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Body */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentConversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No conversations yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Start a direct conversation with a tutor from their profile, or connect with a student through tuition jobs.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                to="/find-tutor"
                className="px-3 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
              >
                Find Tutors
              </Link>
              <Link
                to="/job-board"
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentConversations.map((conv) => {
              const other = conv.other_participant;
              const hasUnread = conv.unread_count > 0;
              const lastMsg = conv.last_message;

              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/dashboard/messages?conversation=${conv.id}`)}
                  className={`group flex items-center justify-between p-3.5 -mx-2 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                    hasUnread ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {other?.avatar ? (
                        <img
                          src={other.avatar}
                          alt={other.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand-500/30"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-black text-white shadow-xs">
                          {other?.name ? other.name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                        </div>
                      )}
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                          {other?.name || 'TutorHub User'}
                        </p>
                        {other?.role && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {other.role}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'font-bold text-brand-900' : 'text-slate-500'}`}>
                        {lastMsg ? lastMsg.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp & Unread count */}
                  <div className="shrink-0 text-right ml-3">
                    {lastMsg && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(lastMsg.created_at)}
                      </span>
                    )}
                    {hasUnread && (
                      <span className="inline-block mt-1 rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        {conv.unread_count} new
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      {recentConversations.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {recentConversations.length} of {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </span>
          <Link
            to="/dashboard/messages"
            className="font-bold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
          >
            Open Chat Center
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
