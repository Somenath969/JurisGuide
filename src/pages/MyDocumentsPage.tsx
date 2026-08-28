import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Folder, Search, MoreVertical, Eye, RefreshCw,
  MessageSquare, Download, Edit2, Trash2, Plus, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { DocumentRecord } from '@/lib/types';

const FOLDER_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  Property: { icon: FileText, color: 'text-navy-600 dark:text-navy-300' },
  Agreements: { icon: FileText, color: 'text-gold-600 dark:text-gold-400' },
  'Court Documents': { icon: FileText, color: 'text-red-600 dark:text-red-400' },
  'Personal Documents': { icon: FileText, color: 'text-green-600 dark:text-green-400' },
};

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchDocs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setDocuments((data as DocumentRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const filtered = documents.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === 'all' || d.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const folders = ['all', 'Property', 'Agreements', 'Court Documents', 'Personal Documents'];

  const deleteDoc = async (id: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    await supabase.from('documents').delete().eq('id', id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setMenuOpen(null);
  };

  const renameDoc = async (id: string) => {
    if (!renameValue.trim()) return;
    await supabase.from('documents').update({ name: renameValue.trim() }).eq('id', id);
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, name: renameValue.trim() } : d));
    setRenaming(null);
    setRenameValue('');
  };

  const downloadDoc = async (doc: DocumentRecord) => {
    if (!doc.storage_path) {
      // Download extracted text
      const blob = new Blob([doc.extracted_text || 'No text available'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 60);
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Documents</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your uploaded legal documents</p>
        </div>
        <Link to="/app/analyze" className="btn-primary !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Upload New
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search documents..."
        />
      </div>

      {/* Folder tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeFolder === folder
                ? 'bg-navy-700 text-white dark:bg-navy-600'
                : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 border border-gray-200 dark:border-navy-800'
            }`}
          >
            {folder === 'all' ? 'All Documents' : folder}
          </button>
        ))}
      </div>

      {/* Documents grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-navy-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search ? 'Try a different search term' : 'Upload your first legal document to get started'}
          </p>
          <Link to="/app/analyze" className="btn-primary mt-4 inline-flex text-sm">
            <Plus className="w-4 h-4" /> Upload Document
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, i) => {
            const folderConfig = FOLDER_ICONS[doc.folder] || FOLDER_ICONS['Personal Documents'];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 relative"
              >
                {menuOpen === doc.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-4 top-12 z-20 w-44 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl shadow-xl py-1">
                      <Link to="/app/analyze" className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <Link to="/app/analyze" className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700">
                        <RefreshCw className="w-4 h-4" /> Analyze Again
                      </Link>
                      <Link to="/app/chat" className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700">
                        <MessageSquare className="w-4 h-4" /> Ask AI
                      </Link>
                      <button onClick={() => downloadDoc(doc)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-navy-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700">
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button onClick={() => { setRenaming(doc.id); setRenameValue(doc.name); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-navy-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700">
                        <Edit2 className="w-4 h-4" /> Rename
                      </button>
                      <button onClick={() => deleteDoc(doc.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center`}>
                    <folderConfig.icon className={`w-5 h-5 ${folderConfig.color}`} />
                  </div>
                  <button onClick={() => setMenuOpen(menuOpen === doc.id ? null : doc.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {renaming === doc.id ? (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') renameDoc(doc.id); if (e.key === 'Escape') setRenaming(null); }}
                      className="input-field !py-1.5 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => renameDoc(doc.id)} className="text-xs text-navy-600 dark:text-gold-400 font-medium">Save</button>
                      <button onClick={() => setRenaming(null)} className="text-xs text-gray-400">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <h3 className="font-semibold text-navy-900 dark:text-white text-sm mb-1 truncate">{doc.name}</h3>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    doc.risk_level === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                    doc.risk_level === 'medium' ? 'bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400' :
                    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  }`}>
                    {doc.risk_level || 'low'} risk
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{doc.language}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
