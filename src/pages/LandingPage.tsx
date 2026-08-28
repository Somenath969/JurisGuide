import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, MessageSquare, BookOpen, Calendar, Globe, Shield,
  Scale, ArrowRight, CheckCircle2, Lock, Sparkles, FileText, Languages,
} from 'lucide-react';
import Logo from '@/components/Logo';
import Disclaimer from '@/components/Disclaimer';

const features = [
  {
    icon: FileSearch,
    title: 'AI Document Analyzer',
    desc: 'Upload any legal document and get a clause-by-clause breakdown in plain language with risk indicators.',
  },
  {
    icon: MessageSquare,
    title: 'JurisGuide AI Assistant',
    desc: 'Ask legal questions and get clear, contextual answers — with document-aware conversations.',
  },
  {
    icon: BookOpen,
    title: 'Legal Topics Library',
    desc: 'Browse simplified guides on property, family, traffic, consumer, and human rights law.',
  },
  {
    icon: Calendar,
    title: 'Court Reminders',
    desc: 'Never miss a hearing. Track case dates, times, and court locations in one place.',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'Get explanations in English, Hindi, Bengali, Tamil, Telugu, and Marathi.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your documents are encrypted and only accessible to you. Privacy is our priority.',
  },
];

const steps = [
  { num: '01', title: 'Upload Your Document', desc: 'Drag and drop a PDF or image of any legal document.' },
  { num: '02', title: 'AI Analyzes Every Clause', desc: 'Our engine breaks down each section and explains it simply.' },
  { num: '03', title: 'Understand & Act', desc: 'Review risk levels, ask questions, and make informed decisions.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-navy-700 dark:hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-navy-700 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#disclaimer" className="hover:text-navy-700 dark:hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Sign In</Link>
            <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-navy-200/30 dark:bg-navy-700/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-gold-200/20 dark:bg-gold-700/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-100 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-800 text-gold-700 dark:text-gold-400 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Legal Assistance
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 dark:text-white leading-[1.1] text-balance">
              Understand Your Legal Documents.
              <span className="block text-gold-600 dark:text-gold-400 mt-2">Know Your Rights.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              JurisGuide uses AI to simplify complex legal information and help you understand your documents in plain language.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="btn-primary text-base">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn-secondary text-base">
                Explore Features
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Bank-grade encryption
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" /> 6 languages
              </div>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">document_analysis.pdf</span>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-navy-800/50 rounded-lg p-4 border border-gray-200 dark:border-navy-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-navy-700 dark:text-navy-300">Clause 7 — Termination</span>
                    <span className="px-2 py-0.5 rounded-full bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400 text-xs font-medium">Medium Risk</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This clause explains when either party can end the agreement.</p>
                  <div className="flex items-start gap-2 text-xs text-navy-600 dark:text-navy-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Written notice required before termination</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-navy-800/50 rounded-lg p-4 border border-gray-200 dark:border-navy-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-navy-700 dark:text-navy-300">Clause 12 — Liability</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium">High Risk</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">You waive certain rights to claim damages.</p>
                  <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>Consult a lawyer before signing</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-navy-800/50 rounded-lg p-4 border border-gray-200 dark:border-navy-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-navy-700 dark:text-navy-300">Summary</span>
                    <Scale className="w-4 h-4 text-gold-500" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">12 clauses analyzed. 2 require high attention. 1 medium risk identified.</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 glass-card px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-800 dark:text-white">AI Analysis Complete</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">in 3.2 seconds</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white">
              Everything you need to navigate the law
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From document analysis to court reminders, JurisGuide brings legal understanding to your fingertips.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-navy-600 dark:text-navy-300" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-white dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white">
              How JurisGuide works
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Three simple steps to legal clarity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="text-5xl font-bold text-gold-400/40 dark:text-gold-600/30 mb-3">{step.num}</div>
                <h3 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-navy-200 dark:text-navy-700">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section id="disclaimer" className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Disclaimer />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12 shadow-2xl"
          >
            <Scale className="w-12 h-12 text-gold-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">
              Ready to understand your legal documents?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
              Join JurisGuide today and get AI-powered legal document analysis, an intelligent chatbot, and more — all in one platform.
            </p>
            <Link to="/signup" className="btn-primary text-base inline-flex">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-navy-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 JurisGuide. Legal information, not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
