import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/notifications';
import type { AppNotification } from '../types';
import { Bell, ArrowRight } from 'lucide-react';

export const DashboardNotificationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
    const interval = setInterval(() => {
      if (isAuthenticated) fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) navigate(link);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">Notifications</h2>
            <p className="text-xs text-slate-500 mt-1">Stay updated with your tuition activities and updates.</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 border border-brand-200 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-slate-300" />
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id, n.link)}
                  className={`p-5 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-brand-50/30' : ''}`}
                >
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" style={{ opacity: n.is_read ? 0.2 : 1 }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400">{n.time_ago}</span>
                      {n.link && (
                        <span className="text-[10px] font-bold text-brand-600 flex items-center gap-0.5">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
