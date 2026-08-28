import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, MessageSquare, TrendingUp, Globe,
  Activity, Shield, AlertCircle, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LANGUAGES } from '@/lib/types';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  documentsAnalyzed: number;
  chatQueries: number;
  languageUsage: { lang: string; count: number }[];
  topicActivity: { type: string; count: number }[];
  recentUsers: { id: string; full_name: string; created_at: string }[];
}

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, docs, chats, messages, recentUsers] = await Promise.all([
          supabase.from('profiles').select('id, full_name, preferred_language, created_at'),
          supabase.from('documents').select('type, language', { count: 'exact' }),
          supabase.from('chats').select('id', { count: 'exact' }),
          supabase.from('messages').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        const allProfiles = (users.data || []) as { id: string; full_name: string; preferred_language: string; created_at: string }[];
        const langCounts: Record<string, number> = {};
        allProfiles.forEach((p) => {
          langCounts[p.preferred_language || 'en'] = (langCounts[p.preferred_language || 'en'] || 0) + 1;
        });

        const languageUsage = Object.entries(langCounts).map(([lang, count]) => ({
          lang: LANGUAGES.find((l) => l.code === lang)?.name || lang,
          count,
        })).sort((a, b) => b.count - a.count);

        // Document types
        const docTypes: Record<string, number> = {};
        // We don't have type data from count query, so approximate
        const { data: docData } = await supabase.from('documents').select('type');
        (docData || []).forEach((d: { type: string }) => {
          docTypes[d.type] = (docTypes[d.type] || 0) + 1;
        });
        const topicActivity = Object.entries(docTypes).map(([type, count]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count,
        })).sort((a, b) => b.count - a.count);

        // Active users = users who created something in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: activeData } = await supabase
          .from('documents')
          .select('user_id')
          .gte('created_at', sevenDaysAgo);
        const activeUserIds = new Set((activeData || []).map((d: { user_id: string }) => d.user_id));

        setStats({
          totalUsers: allProfiles.length,
          activeUsers: activeUserIds.size,
          documentsAnalyzed: docs.count || 0,
          chatQueries: messages.count || 0,
          languageUsage,
          topicActivity,
          recentUsers: (recentUsers.data || []) as { id: string; full_name: string; created_at: string }[],
        });
      } catch (err) {
        console.error('Admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!profile?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You need administrator privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-navy-600 dark:text-navy-300', bg: 'bg-navy-50 dark:bg-navy-800' },
    { icon: Activity, label: 'Active Users (7d)', value: stats.activeUsers, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
    { icon: FileText, label: 'Documents Analyzed', value: stats.documentsAnalyzed, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-950/30' },
    { icon: MessageSquare, label: 'Chat Queries', value: stats.chatQueries, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-gold-500" /> Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Platform statistics and system activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-navy-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Language usage */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Language Usage
          </h3>
          {stats.languageUsage.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <div className="space-y-3">
              {stats.languageUsage.map((lang) => {
                const pct = stats.totalUsers > 0 ? (lang.count / stats.totalUsers) * 100 : 0;
                return (
                  <div key={lang.lang}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-navy-800 dark:text-gray-200">{lang.lang}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{lang.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-navy-800 overflow-hidden">
                      <div className="h-full rounded-full bg-navy-500 dark:bg-navy-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Document types */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-6">
          <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Document Types
          </h3>
          {stats.topicActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No documents analyzed yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topicActivity.map((t) => {
                const max = Math.max(...stats.topicActivity.map((x) => x.count));
                const pct = max > 0 ? (t.count / max) * 100 : 0;
                return (
                  <div key={t.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-navy-800 dark:text-gray-200">{t.type}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-navy-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gold-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent users */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Recent Users
        </h3>
        {stats.recentUsers.length === 0 ? (
          <p className="text-sm text-gray-400">No users yet</p>
        ) : (
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50">
                <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white text-sm font-semibold">
                  {u.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-800 dark:text-white">{u.full_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Joined {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-navy-50 dark:bg-navy-800/50 border border-navy-200 dark:border-navy-700 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-navy-800 dark:text-white">Privacy Notice:</strong> The admin dashboard shows aggregate statistics only.
          Individual document contents and chat messages are never exposed. User data is protected by row-level security policies.
        </p>
      </div>
    </div>
  );
}
