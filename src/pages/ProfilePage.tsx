import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Globe, Bell, Shield, Check,
  AlertCircle, Loader2, FileText, MessageSquare, Bookmark,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { LANGUAGES } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ docs: 0, chats: 0, saved: 0 });
  const [notifications, setNotifications] = useState({ email: true, push: false, reminders: true });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setMobile(profile.mobile || '');
      setLocation(profile.location || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [docs, chats, savedMsgs] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('chats').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('messages').select('id', { count: 'exact' }).eq('saved', true).eq('role', 'assistant'),
      ]);
      setStats({ docs: docs.count || 0, chats: chats.count || 0, saved: savedMsgs.count || 0 });
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          mobile,
          location,
          preferred_language: language,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-navy-700 dark:bg-navy-600 flex items-center justify-center text-white text-2xl font-bold">
            {fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">{fullName || 'User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
            {profile?.is_admin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400 text-xs font-medium">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: FileText, label: 'Documents', value: stats.docs },
            { icon: MessageSquare, label: 'Conversations', value: stats.chats },
            { icon: Bookmark, label: 'Saved Responses', value: stats.saved },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
              <s.icon className="w-5 h-5 text-navy-500 dark:text-navy-300 mx-auto mb-1" />
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Mobile</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field pl-11" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field pl-11" placeholder="Mumbai, India" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Preferred Language
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                language === lang.code
                  ? 'border-navy-500 bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-white'
                  : 'border-gray-200 dark:border-navy-700 hover:border-navy-300 dark:hover:border-navy-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium">{lang.native}</p>
                <p className="text-xs text-gray-400">{lang.name}</p>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-navy-600 dark:text-gold-400" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Notification Settings
        </h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates about your documents and reminders' },
            { key: 'push', label: 'Push Notifications', desc: 'Get notified in your browser about upcoming hearings' },
            { key: 'reminders', label: 'Court Reminders', desc: 'Remind me before upcoming court dates' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50">
              <div>
                <p className="text-sm font-medium text-navy-800 dark:text-white">{n.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? 'bg-navy-600' : 'bg-gray-300 dark:bg-navy-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[n.key as keyof typeof notifications] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-navy-600 dark:text-navy-300" /> Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50">
            <div>
              <p className="text-sm font-medium text-navy-800 dark:text-white">Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last changed: Never</p>
            </div>
            <button className="btn-secondary !py-2 text-sm">Change Password</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50">
            <div>
              <p className="text-sm font-medium text-navy-800 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
            </div>
            <button className="btn-secondary !py-2 text-sm">Enable</button>
          </div>
        </div>
      </motion.div>

      {/* Save bar */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : saved ? <><Check className="w-5 h-5" /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      <Disclaimer compact />
    </div>
  );
}
