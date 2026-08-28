import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, MessageSquare, Plus, Copy, Check, Trash2,
  Bookmark, Sparkles, Scale, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Chat, Message, DocumentRecord } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';

const SUGGESTED_QUESTIONS = [
  'What does "force majeure" mean in a contract?',
  'What are my basic rights as a tenant?',
  'What documents do I need to buy property?',
  'What does a court notice mean?',
  'What is the difference between civil and criminal cases?',
  'What are my consumer rights for a defective product?',
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [linkedDocId, setLinkedDocId] = useState<string | null>(null);
  const [showDocSelect, setShowDocSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      const { data } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setChats((data as Chat[]) || []);
    };
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('documents')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setDocuments((data as DocumentRecord[]) || []);
    };
    fetchChats();
    fetchDocs();
  }, [user]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: true });
      setMessages((data as Message[]) || []);
    };
    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setInput('');
    setError('');
    setLoading(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, chat_id: activeChat?.id || '', role: 'user', content: message, saved: false, created_at: new Date().toISOString() }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            message,
            chatId: activeChat?.id || null,
            documentId: linkedDocId,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Remove optimistic message and add real ones
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      // Fetch actual messages from DB
      if (data.chatId !== activeChat?.id) {
        // New chat was created
        const { data: newChat } = await supabase
          .from('chats')
          .select('*')
          .eq('id', data.chatId)
          .maybeSingle();
        if (newChat) {
          setActiveChat(newChat as Chat);
          setChats((prev) => [newChat as Chat, ...prev]);
        }
      }

      // Fetch all messages for this chat
      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', data.chatId)
        .order('created_at', { ascending: true });
      setMessages((allMessages as Message[]) || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setActiveChat(null);
    setMessages([]);
    setLinkedDocId(null);
    setShowDocSelect(false);
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from('chats').delete().eq('id', chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat?.id === chatId) newChat();
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSave = async (msg: Message) => {
    await supabase.from('messages').update({ saved: !msg.saved }).eq('id', msg.id);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, saved: !m.saved } : m));
  };

  const linkedDoc = documents.find((d) => d.id === linkedDocId);

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
      {/* Chat list sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900">
        <div className="p-3 border-b border-gray-200 dark:border-navy-800">
          <button onClick={newChat} className="btn-primary w-full !py-2.5 text-sm">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {chats.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  activeChat?.id === chat.id
                    ? 'bg-navy-50 dark:bg-navy-800'
                    : 'hover:bg-gray-50 dark:hover:bg-navy-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-navy-800 dark:text-gray-200 truncate">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-navy-700 dark:bg-navy-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h2 className="font-semibold text-navy-900 dark:text-white text-sm">JurisGuide AI</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeChat ? activeChat.title : 'New conversation'}
                </p>
              </div>
            </div>
            <div className="relative">
              {linkedDoc && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-50 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-800">
                  <span className="text-xs font-medium text-gold-700 dark:text-gold-400 truncate max-w-[150px]">
                    {linkedDoc.name}
                  </span>
                  <button onClick={() => setLinkedDocId(null)} className="text-gold-600 hover:text-gold-800">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center mb-4">
                <Scale className="w-8 h-8 text-navy-500 dark:text-navy-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Ask JurisGuide AI</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                I can help you understand legal terms, explain clauses in your documents, and provide general legal information.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-2 w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left p-3 rounded-xl border border-gray-200 dark:border-navy-700 hover:border-navy-400 dark:hover:border-navy-500 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-all text-sm text-navy-700 dark:text-gray-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-lg bg-navy-700 dark:bg-navy-600 flex items-center justify-center">
                          <Scale className="w-3.5 h-3.5 text-gold-400" />
                        </div>
                        <span className="text-xs font-medium text-navy-700 dark:text-gray-300">JurisGuide AI</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-navy-700 text-white dark:bg-navy-600'
                          : 'bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-navy-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-1.5 ml-1">
                        <button
                          onClick={() => copyMessage(msg.content, msg.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-400 hover:text-navy-600 dark:hover:text-white transition-colors"
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => toggleSave(msg)}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors ${
                            msg.saved ? 'text-gold-500' : 'text-gray-400 hover:text-navy-600 dark:hover:text-white'
                          }`}
                          title={msg.saved ? 'Saved' : 'Save'}
                        >
                          <Bookmark className="w-3.5 h-3.5" fill={msg.saved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-navy-500 animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400">JurisGuide AI is thinking...</span>
              </div>
            </motion.div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {documents.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowDocSelect(!showDocSelect)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-700 text-xs font-medium text-navy-700 dark:text-gray-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {linkedDoc ? 'Change document' : 'Link document'}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showDocSelect && (
                    <div className="absolute bottom-full mb-2 left-0 w-64 max-h-48 overflow-y-auto scrollbar-thin bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl shadow-xl z-10">
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => { setLinkedDocId(doc.id); setShowDocSelect(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-navy-700 text-sm text-navy-800 dark:text-gray-200 truncate"
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                className="input-field flex-1 resize-none !py-3 max-h-32"
                placeholder="Ask a legal question..."
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="btn-primary !px-4 !py-3"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              <Disclaimer compact />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
