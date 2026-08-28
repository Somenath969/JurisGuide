import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, Clock, MapPin, Gavel, X, Trash2, Edit2,
  ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Reminder } from '@/lib/types';

export default function CourtRemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<'upcoming' | 'calendar'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [form, setForm] = useState({
    title: '',
    case_number: '',
    court: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    setReminders((data as Reminder[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReminders(); }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = reminders.filter((r) => r.date >= today);
  const past = reminders.filter((r) => r.date < today);

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', case_number: '', court: '', date: '', time: '', location: '', notes: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      case_number: r.case_number,
      court: r.court,
      date: r.date,
      time: r.time,
      location: r.location,
      notes: r.notes,
    });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.date) {
      setError('Please enter a case name and hearing date.');
      return;
    }
    setError('');

    if (editingId) {
      await supabase.from('reminders').update(form).eq('id', editingId);
    } else {
      await supabase.from('reminders').insert({ ...form, user_id: user.id });
    }
    setShowModal(false);
    fetchReminders();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    await supabase.from('reminders').delete().eq('id', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Calendar helpers
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const remindersByDate = reminders.reduce<Record<string, Reminder[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date(today).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Court Reminders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track your hearings and important legal dates</p>
        </div>
        <button onClick={openAdd} className="btn-primary !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {/* View toggle */}
      <div className="inline-flex rounded-xl border border-gray-200 dark:border-navy-700 p-1 bg-white dark:bg-navy-900">
        <button
          onClick={() => setView('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'upcoming' ? 'bg-navy-700 text-white dark:bg-navy-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-navy-700 text-white dark:bg-navy-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Calendar
        </button>
      </div>

      {view === 'upcoming' ? (
        loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">No upcoming hearings</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a reminder to stay on top of your court dates.</p>
            <button onClick={openAdd} className="btn-primary mt-4 inline-flex text-sm">
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((r, i) => {
              const days = daysUntil(r.date);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      days <= 3 ? 'bg-red-50 dark:bg-red-950/30' : days <= 7 ? 'bg-gold-50 dark:bg-gold-950/30' : 'bg-navy-50 dark:bg-navy-800'
                    }`}>
                      <span className={`text-xl font-bold ${
                        days <= 3 ? 'text-red-600 dark:text-red-400' : days <= 7 ? 'text-gold-600 dark:text-gold-400' : 'text-navy-700 dark:text-navy-200'
                      }`}>
                        {new Date(r.date).getDate()}
                      </span>
                      <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
                        {new Date(r.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-navy-900 dark:text-white">{r.title}</h3>
                          {r.case_number && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Case: {r.case_number}</p>}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          days <= 3 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                          days <= 7 ? 'bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400' :
                          'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        }`}>
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days away`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {r.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.time}</span>}
                        {r.court && <span className="flex items-center gap-1"><Gavel className="w-3.5 h-3.5" /> {r.court}</span>}
                        {r.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.location}</span>}
                      </div>
                      {r.notes && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-navy-800/50 rounded-lg p-2">{r.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 hover:text-navy-600 dark:hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {past.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Past Hearings</p>
                {past.slice(0, 5).map((r) => (
                  <div key={r.id} className="card p-4 opacity-60 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-navy-800 dark:text-gray-200">{r.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.date)}</p>
                      </div>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        /* Calendar view */
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayReminders = remindersByDate[dateStr] || [];
              const isToday = dateStr === today;
              return (
                <div
                  key={day}
                  className={`min-h-[60px] p-1.5 rounded-lg border transition-colors ${
                    isToday ? 'border-navy-500 bg-navy-50 dark:bg-navy-800/50' : 'border-gray-100 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-800/30'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-navy-700 dark:text-navy-200' : 'text-gray-500 dark:text-gray-400'}`}>{day}</span>
                  {dayReminders.map((r) => (
                    <div key={r.id} className="mt-1 px-1.5 py-0.5 rounded bg-gold-100 dark:bg-gold-900/40 text-[10px] text-gold-700 dark:text-gold-400 truncate cursor-pointer hover:bg-gold-200 dark:hover:bg-gold-900/60" onClick={() => openEdit(r)}>
                      {r.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  {editingId ? 'Edit Reminder' : 'Add Court Reminder'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Case Name *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Property Case vs. Smith"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Case Number</label>
                    <input
                      type="text"
                      value={form.case_number}
                      onChange={(e) => setForm({ ...form, case_number: e.target.value })}
                      className="input-field"
                      placeholder="e.g., CIV-2026-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Court</label>
                    <input
                      type="text"
                      value={form.court}
                      onChange={(e) => setForm({ ...form, court: e.target.value })}
                      className="input-field"
                      placeholder="e.g., District Court"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Hearing Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Court Room 3, City Hall"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 dark:text-gray-200 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="input-field resize-y"
                    placeholder="Additional notes about this hearing..."
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={save} className="btn-primary flex-1">
                    {editingId ? 'Update Reminder' : 'Add Reminder'}
                  </button>
                  <button onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
