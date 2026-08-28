import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, MessageSquare, FolderOpen, BookOpen, Calendar, Globe,
  FileText, Clock, TrendingUp, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import type { DocumentRecord, Reminder } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';

const quickActions = [
  { to: '/app/analyze', icon: FileSearch, title: 'Analyze Document', desc: 'Upload or scan a legal document', color: 'navy' },
  { to: '/app/chat', icon: MessageSquare, title: 'Ask JurisGuide', desc: 'Ask legal questions with AI', color: 'gold' },
  { to: '/app/documents', icon: FolderOpen, title: 'My Documents', desc: 'View and manage your documents', color: 'navy' },
  { to: '/app/topics', icon: BookOpen, title: 'Legal Topics', desc: 'Explore simplified legal guides', color: 'gold' },
  { to: '/app/reminders', icon: Calendar, title: 'Court Reminders', desc: 'View upcoming hearings', color: 'navy' },
  { to: '/app/profile', icon: Globe, title: 'Change Language', desc: 'Select your preferred language', color: 'gold' },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [docCount, setDocCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocumentRecord[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const [docs, chats, reminders, recent] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('chats').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('reminders').select('*').eq('user_id', profile.id).gte('date', today).order('date').limit(3),
        supabase.from('documents').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3),
      ]);
      setDocCount(docs.count || 0);
      setChatCount(chats.count || 0);
      setUpcomingReminders((reminders.data as Reminder[]) || []);
      setRecentDocs((recent.data as DocumentRecord[]) || []);
    };
    fetchData();
  }, [profile]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('howCanHelp')}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Documents', value: docCount, color: 'text-navy-600 dark:text-navy-300' },
          { icon: MessageSquare, label: 'Conversations', value: chatCount, color: 'text-gold-600 dark:text-gold-400' },
          { icon: Calendar, label: 'Upcoming', value: upcomingReminders.length, color: 'text-navy-600 dark:text-navy-300' },
          { icon: TrendingUp, label: 'Member since', value: new Date(profile?.created_at || Date.now()).getFullYear(), color: 'text-gold-600 dark:text-gold-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="card p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link to={action.to} className="card card-hover p-5 block group">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    action.color === 'navy'
                      ? 'bg-navy-50 dark:bg-navy-800'
                      : 'bg-gold-50 dark:bg-gold-900/30'
                  }`}>
                    <action.icon className={`w-5 h-5 ${
                      action.color === 'navy'
                        ? 'text-navy-600 dark:text-navy-300'
                        : 'text-gold-600 dark:text-gold-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy-900 dark:text-white text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-navy-600 dark:group-hover:text-white transition-colors flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Two-column: upcoming reminders + recent docs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">Upcoming Hearings</h3>
            <Link to="/app/reminders" className="text-xs text-navy-600 dark:text-gold-400 font-medium hover:underline">
              View all
            </Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming hearings</p>
              <Link to="/app/reminders" className="text-xs text-navy-600 dark:text-gold-400 font-medium hover:underline mt-2 inline-block">
                Add a reminder
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                  <div className="w-10 h-10 rounded-lg bg-navy-100 dark:bg-navy-700 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-navy-700 dark:text-navy-200">
                      {new Date(r.date).getDate()}
                    </span>
                    <span className="text-[10px] text-navy-500 dark:text-navy-300 uppercase">
                      {new Date(r.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800 dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.time || 'Time TBD'} {r.court && `• ${r.court}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">Recent Documents</h3>
            <Link to="/app/documents" className="text-xs text-navy-600 dark:text-gold-400 font-medium hover:underline">
              View all
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet</p>
              <Link to="/app/analyze" className="text-xs text-navy-600 dark:text-gold-400 font-medium hover:underline mt-2 inline-block">
                Upload your first document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                  <div className="w-10 h-10 rounded-lg bg-gold-50 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800 dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString()} • {doc.type}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    doc.risk_level === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                    doc.risk_level === 'medium' ? 'bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400' :
                    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  }`}>
                    {doc.risk_level || 'low'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Disclaimer compact />
    </div>
  );
}
