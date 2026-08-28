import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, FileText, AlertTriangle, Lightbulb, Users, ArrowRight,
  LayoutDashboard, ScanLine, Upload, FolderOpen, MessageSquare,
  Gavel, Calendar, Globe, Shield, Database, Lock, Server,
  ChevronLeft, ChevronRight, Home, Sparkles, BookOpen,
  Heart, Car, ShieldCheck, UserCog, Languages, Brain,
  CheckCircle2, FileSearch, Bell, FileWarning, ArrowDown,
  Layers, Cloud, KeyRound, Eye, Settings, Download,
} from 'lucide-react';
import Logo from '@/components/Logo';

const TOTAL_SLIDES = 15;

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => Math.min(c + 1, TOTAL_SLIDES - 1));
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        setDirection(-1);
        setCurrent(0);
      } else if (e.key === 'Escape') {
        window.location.href = '/';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 60 : -60, scale: 0.98 }),
  };

  return (
    <div className="fixed inset-0 bg-navy-950 overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-navy-800/50 bg-navy-900/80 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline text-xs text-navy-400 ml-2">Presentation</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-navy-300 font-medium tabular-nums">
            {String(current + 1).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
          </span>
          <a
            href="/JurisGuide-Presentation.pptx"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> PPTX
          </a>
          <a href="/" className="p-2 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto scrollbar-thin"
          >
            {renderSlide(current)}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-navy-800/60 backdrop-blur hover:bg-navy-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          disabled={current === TOTAL_SLIDES - 1}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-navy-800/60 backdrop-blur hover:bg-navy-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="h-14 flex items-center justify-center gap-1.5 border-t border-navy-800/50 bg-navy-900/80 backdrop-blur px-4">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-8 bg-gold-400' : 'w-1.5 bg-navy-700 hover:bg-navy-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shared slide components ──────────────────────────────────

function SlideShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-full flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 py-10 ${className}`}>
      <div className="w-full max-w-5xl">{children}</div>
    </div>
  );
}

function SlideTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium mb-4">
      {children}
    </div>
  );
}

function SlideTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">{children}</h2>;
}

function SlideSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-navy-300 text-sm sm:text-base max-w-2xl mb-8">{children}</p>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-navy-800/50 border border-navy-700/50 rounded-xl p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function FlowArrow({ className = '' }: { className?: string }) {
  return <ArrowDown className={`w-5 h-5 text-gold-400 mx-auto ${className}`} />;
}

function FlowStep({ icon: Icon, label, color = 'text-gold-400' }: { icon: typeof Scale; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 bg-navy-800/60 border border-navy-700/50 rounded-xl px-4 py-3 w-full">
      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
      <span className="text-sm text-navy-100 font-medium">{label}</span>
    </div>
  );
}

// ─── Individual slides ────────────────────────────────────────

function renderSlide(index: number) {
  switch (index) {
    case 0: return <Slide01 />;
    case 1: return <Slide02 />;
    case 2: return <Slide03 />;
    case 3: return <Slide04 />;
    case 4: return <Slide05 />;
    case 5: return <Slide06 />;
    case 6: return <Slide07 />;
    case 7: return <Slide08 />;
    case 8: return <Slide09 />;
    case 9: return <Slide10 />;
    case 10: return <Slide11 />;
    case 11: return <Slide12 />;
    case 12: return <Slide13 />;
    case 13: return <Slide14 />;
    case 14: return <Slide15 />;
    default: return null;
  }
}

// SLIDE 1 — TITLE
function Slide01() {
  return (
    <SlideShell className="items-center text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 border border-gold-500/30 flex items-center justify-center shadow-2xl">
            <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-gold-400" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
          Juris<span className="text-gold-400">Guide</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-navy-300 max-w-2xl mx-auto">
          Making Legal Information Simple, Accessible and Understandable
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: FileText, label: 'Legal Documents' },
            { icon: Brain, label: 'AI Analysis' },
            { icon: Scale, label: 'Rights & Duties' },
            { icon: Languages, label: 'Multilingual' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800/50 border border-navy-700/50">
              <item.icon className="w-4 h-4 text-gold-400" />
              <span className="text-xs text-navy-200">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-navy-500">AI-Powered Legal Assistance Platform</p>
      </motion.div>
    </SlideShell>
  );
}

// SLIDE 2 — THE REAL-WORLD PROBLEM
function Slide02() {
  const problems = [
    { icon: FileText, text: 'Complex legal language in contracts and agreements' },
    { icon: AlertTriangle, text: 'Lack of legal awareness among common citizens' },
    { icon: FileWarning, text: 'Difficulty understanding what a clause means' },
    { icon: BookOpen, text: 'Finding reliable legal information is hard' },
    { icon: Languages, text: 'Language barriers prevent understanding' },
    { icon: Gavel, text: 'Confusion about court procedures' },
    { icon: Calendar, text: 'Fear of missing important court dates' },
    { icon: Shield, text: 'Unaware of rights, duties and consequences' },
  ];

  return (
    <SlideShell>
      <SlideTag><AlertTriangle className="w-3 h-3" /> The Problem</SlideTag>
      <SlideTitle>People struggle to understand legal documents</SlideTitle>
      <SlideSubtitle>A person receives a property agreement full of complicated legal terms. They sign it without fully understanding the conditions.</SlideSubtitle>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scenario card */}
        <Card className="border-gold-500/20">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-semibold text-white">A Real Scenario</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-xs font-bold text-gold-400">1</div>
              <span>Receives a 15-page property agreement</span>
            </div>
            <FlowArrow className="my-1" />
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-xs font-bold text-gold-400">2</div>
              <span>Cannot understand legal terminology</span>
            </div>
            <FlowArrow className="my-1" />
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-7 h-7 rounded-lg bg-red-900/40 flex items-center justify-center text-xs font-bold text-red-400">3</div>
              <span>Signs without knowing the full implications</span>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-red-950/30 border border-red-800/40">
              <p className="text-xs text-red-300">Consequence: Hidden clauses, financial risk, or missed obligations</p>
            </div>
          </div>
        </Card>

        {/* Problems grid */}
        <div className="grid grid-cols-2 gap-3">
          {problems.map((p) => (
            <div key={p.text} className="flex items-start gap-2.5 p-3 rounded-lg bg-navy-800/40 border border-navy-700/40">
              <p.icon className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-navy-200 leading-snug">{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// SLIDE 3 — WHY THIS PROBLEM MATTERS
function Slide03() {
  const impacts = [
    'People may sign documents without understanding them',
    'Important conditions and hidden clauses can be overlooked',
    'People depend on unreliable online information or hearsay',
    'Legal procedures feel confusing and intimidating',
    'Language becomes a barrier to accessing legal help',
    'People may not know their basic rights and responsibilities',
  ];

  return (
    <SlideShell>
      <SlideTag><Lightbulb className="w-3 h-3" /> Why It Matters</SlideTag>
      <SlideTitle>The real-world impact of legal confusion</SlideTitle>

      <div className="grid lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          {impacts.map((impact, i) => (
            <motion.div
              key={impact}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-navy-800/40 border border-navy-700/40"
            >
              <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gold-400">{i + 1}</span>
              </div>
              <span className="text-sm text-navy-100">{impact}</span>
            </motion.div>
          ))}
        </div>

        <Card className="border-gold-500/20 bg-gradient-to-br from-navy-800/60 to-navy-900/60">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-semibold text-white">The Key Insight</h3>
          </div>
          <p className="text-lg text-white leading-relaxed font-medium">
            "People do not always need more legal information; they need legal information explained in a way they can understand."
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 w-12 bg-gold-400 rounded-full" />
            <span className="text-xs text-navy-400">This is what JurisGuide aims to solve</span>
          </div>
        </Card>
      </div>
    </SlideShell>
  );
}

// SLIDE 4 — OUR SOLUTION
function Slide04() {
  const features = [
    { icon: FileSearch, label: 'AI Document Understanding' },
    { icon: MessageSquare, label: 'Legal Chatbot' },
    { icon: Languages, label: 'Multilingual Explanations' },
    { icon: Gavel, label: 'Crime & Punishment Awareness' },
    { icon: BookOpen, label: 'Court Proceeding Guidance' },
    { icon: Calendar, label: 'Court Reminders' },
    { icon: Lock, label: 'Secure Document Storage' },
    { icon: Layers, label: 'Legal Domain Selection' },
  ];

  return (
    <SlideShell>
      <SlideTag><Sparkles className="w-3 h-3" /> Our Solution</SlideTag>
      <SlideTitle>JurisGuide: One platform for legal understanding</SlideTitle>
      <SlideSubtitle>A single digital platform that combines AI document analysis, a legal chatbot, multilingual support, and legal domain guidance.</SlideSubtitle>

      <div className="flex flex-col items-center">
        {/* Central hub */}
        <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 border-2 border-gold-500/40 flex items-center justify-center shadow-2xl mb-6">
          <div className="text-center">
            <Scale className="w-8 h-8 text-gold-400 mx-auto mb-1" />
            <span className="text-sm font-bold text-white">JurisGuide</span>
          </div>
        </div>

        {/* Feature grid around hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-navy-800/40 border border-navy-700/40 text-center"
            >
              <f.icon className="w-6 h-6 text-gold-400" />
              <span className="text-xs text-navy-100 font-medium leading-tight">{f.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// SLIDE 5 — USER JOURNEY
function Slide05() {
  const steps = [
    { icon: Users, label: 'Register / Login' },
    { icon: Languages, label: 'Select Language' },
    { icon: Layers, label: 'Select Legal Domain' },
    { icon: ScanLine, label: 'Upload / Scan Document or Ask a Question' },
    { icon: Brain, label: 'AI Analyzes the Information' },
    { icon: FileText, label: 'Simple Explanation Generated' },
    { icon: ShieldCheck, label: 'Understand Rights, Duties & Consequences' },
    { icon: FolderOpen, label: 'Save Document / Ask Chatbot / Set Reminder' },
  ];

  return (
    <SlideShell>
      <SlideTag><Users className="w-3 h-3" /> User Journey</SlideTag>
      <SlideTitle>How a citizen uses JurisGuide</SlideTitle>

      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-3 bg-navy-800/50 border border-navy-700/50 rounded-xl px-4 py-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gold-400">{i + 1}</span>
              </div>
              <step.icon className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span className="text-sm text-navy-100 font-medium">{step.label}</span>
            </div>
            {i < steps.length - 1 && i % 2 === 0 && (
              <ArrowRight className="hidden sm:block w-4 h-4 text-gold-400/50 flex-shrink-0" />
            )}
            {i < steps.length - 1 && i % 2 === 1 && (
              <FlowArrow className="sm:hidden" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Card className="border-gold-500/20 max-w-lg">
          <p className="text-sm text-navy-200 text-center">
            From confusion to clarity — in the user's own language, at their own pace.
          </p>
        </Card>
      </div>
    </SlideShell>
  );
}

// SLIDE 6 — CORE FEATURES
function Slide06() {
  const features = [
    { icon: MessageSquare, label: 'AI Legal Chatbot', desc: 'Ask legal questions in plain language' },
    { icon: ScanLine, label: 'Document Scanner', desc: 'Scan documents using camera' },
    { icon: Upload, label: 'Upload Documents', desc: 'Upload PDFs and images' },
    { icon: FolderOpen, label: 'View Documents', desc: 'Manage previously uploaded files' },
    { icon: Brain, label: 'AI Legal Agent', desc: 'AI-powered document analysis' },
    { icon: Gavel, label: 'Crime & Punishment Guide', desc: 'Understand offences and consequences' },
    { icon: BookOpen, label: 'Court Proceeding Guidance', desc: 'Learn how court procedures work' },
    { icon: Calendar, label: 'Court Scheduler & Reminders', desc: 'Never miss a hearing date' },
    { icon: Languages, label: 'Language Selection', desc: 'Choose your preferred language' },
    { icon: Layers, label: 'Legal Domain Selection', desc: 'Focus on your specific legal area' },
    { icon: Shield, label: 'Secure User Account', desc: 'Protected personal legal workspace' },
  ];

  return (
    <SlideShell>
      <SlideTag><LayoutDashboard className="w-3 h-3" /> Core Features</SlideTag>
      <SlideTitle>The JurisGuide dashboard</SlideTitle>
      <SlideSubtitle>Eleven integrated features accessible from a single, clean dashboard.</SlideSubtitle>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-gold-500/30 transition-colors h-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{f.label}</h4>
                  <p className="text-xs text-navy-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

// SLIDE 7 — AI DOCUMENT ANALYSIS
function Slide07() {
  const steps = [
    { icon: Upload, label: 'Upload PDF / Image' },
    { icon: ScanLine, label: 'OCR if required' },
    { icon: FileText, label: 'Text extraction' },
    { icon: Brain, label: 'AI analysis' },
    { icon: FileSearch, label: 'Clause identification' },
    { icon: FileText, label: 'Terms explained' },
    { icon: AlertTriangle, label: 'Risky clauses highlighted' },
    { icon: Sparkles, label: 'Simple-language output' },
    { icon: Languages, label: 'Multilingual output' },
  ];

  return (
    <SlideShell>
      <SlideTag><FileSearch className="w-3 h-3" /> AI Document Analysis</SlideTag>
      <SlideTitle>From legal jargon to plain language</SlideTitle>

      {/* Flow */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-navy-800/50 border border-navy-700/50 rounded-lg px-3 py-2">
              <step.icon className="w-4 h-4 text-gold-400" />
              <span className="text-xs text-navy-100 font-medium">{step.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-navy-600" />}
          </div>
        ))}
      </div>

      {/* Example */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-red-800/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-semibold text-red-300 uppercase tracking-wide">Original Clause</h4>
          </div>
          <p className="text-sm text-navy-200 italic leading-relaxed">
            "Party of the first part shall indemnify and hold harmless the party of the second part from all claims, damages, and liabilities arising out of..."
          </p>
        </Card>
        <Card className="border-green-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-400" />
            <h4 className="text-xs font-semibold text-green-300 uppercase tracking-wide">JurisGuide Explanation</h4>
          </div>
          <p className="text-sm text-navy-100 leading-relaxed">
            "This means the first party may have to compensate the other party for certain losses. If something goes wrong, you could be responsible for covering their costs."
          </p>
        </Card>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-gold-300/80 bg-gold-950/20 border border-gold-800/30 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>JurisGuide provides general legal information and does not replace a qualified lawyer. Always consult a legal professional for advice specific to your situation.</span>
      </div>
    </SlideShell>
  );
}

// SLIDE 8 — CRIME, PUNISHMENT, RIGHTS & DUTIES
function Slide08() {
  const items = [
    { icon: Gavel, label: 'Meaning of the offence', desc: 'What the offence actually means in simple terms' },
    { icon: BookOpen, label: 'Relevant law / section', desc: 'Which law or section applies, where known' },
    { icon: AlertTriangle, label: 'Possible punishment or fine', desc: 'What consequences may apply' },
    { icon: FileText, label: 'Basic legal procedure', desc: 'What steps are generally involved' },
    { icon: Shield, label: 'Rights & responsibilities', desc: 'Your related rights and duties' },
  ];

  return (
    <SlideShell>
      <SlideTag><Gavel className="w-3 h-3" /> Crime, Punishment, Rights & Duties</SlideTag>
      <SlideTitle>Understanding offences and their consequences</SlideTitle>
      <SlideSubtitle>Users can search or explore an offence and understand what it means and what may follow.</SlideSubtitle>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                  <p className="text-xs text-navy-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-gold-500/20 bg-gold-950/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gold-200/90">
            <strong>Disclaimer:</strong> Possible legal consequences depend on the applicable law, jurisdiction and facts of the case. JurisGuide provides general legal information, not a final legal judgment.
          </p>
        </div>
      </Card>
    </SlideShell>
  );
}

// SLIDE 9 — MULTILINGUAL & ACCESSIBILITY
function Slide09() {
  const languages = ['English', 'हिन्दी', 'বাংলা', 'தமிழ்', 'తెలుగు', 'मराठी'];

  return (
    <SlideShell>
      <SlideTag><Languages className="w-3 h-3" /> Multilingual & Accessibility</SlideTag>
      <SlideTitle>Legal understanding in your own language</SlideTitle>
      <SlideSubtitle>Language should never be a barrier to understanding your rights and documents.</SlideSubtitle>

      <div className="grid lg:grid-cols-2 gap-6 items-center">
        {/* Flow */}
        <div className="space-y-3">
          <FlowStep icon={FileText} label="Legal document (any language)" color="text-navy-300" />
          <FlowArrow />
          <FlowStep icon={Brain} label="AI explanation generated" />
          <FlowArrow />
          <FlowStep icon={Languages} label="Translated to preferred language" />
          <FlowArrow />
          <FlowStep icon={CheckCircle2} label="Simple, understandable output" color="text-green-400" />
        </div>

        {/* Languages */}
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {languages.map((lang, i) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-navy-800/50 border border-navy-700/50"
              >
                <Globe className="w-5 h-5 text-gold-400 mb-2" />
                <span className="text-sm font-medium text-white">{lang}</span>
              </motion.div>
            ))}
          </div>
          <Card className="border-gold-500/20">
            <p className="text-sm text-navy-200">
              Users can access explanations in languages they are comfortable with, making legal information accessible to more citizens.
            </p>
          </Card>
        </div>
      </div>
    </SlideShell>
  );
}

// SLIDE 10 — BACKEND ARCHITECTURE
function Slide10() {
  const layers = [
    { icon: Users, label: 'USER', color: 'text-blue-400' },
    { icon: LayoutDashboard, label: 'REACT FRONTEND', color: 'text-cyan-400' },
    { icon: FileText, label: 'APPLICATION LOGIC / TYPESCRIPT', color: 'text-teal-400' },
  ];

  const supabaseServices = [
    { icon: Shield, label: 'Supabase Authentication' },
    { icon: Database, label: 'PostgreSQL Database' },
    { icon: Cloud, label: 'Supabase Storage' },
    { icon: Lock, label: 'Row Level Security' },
    { icon: Server, label: 'Edge Functions' },
  ];

  return (
    <SlideShell>
      <SlideTag><Server className="w-3 h-3" /> Backend Architecture</SlideTag>
      <SlideTitle>Technical architecture of JurisGuide</SlideTitle>

      <div className="flex flex-col items-center gap-2">
        {/* Top layers */}
        {layers.map((layer) => (
          <div key={layer.label} className="w-full max-w-md">
            <div className="flex items-center gap-3 bg-navy-800/50 border border-navy-700/50 rounded-xl px-4 py-2.5 justify-center">
              <layer.icon className={`w-4 h-4 ${layer.color}`} />
              <span className="text-xs font-semibold text-white tracking-wide">{layer.label}</span>
            </div>
            <FlowArrow />
          </div>
        ))}

        {/* Supabase box */}
        <div className="w-full max-w-lg">
          <div className="bg-navy-800/60 border border-gold-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <Database className="w-5 h-5 text-gold-400" />
              <span className="text-sm font-bold text-gold-400">SUPABASE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supabaseServices.map((s) => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-900/50 border border-navy-700/40">
                  <s.icon className="w-3.5 h-3.5 text-gold-400/80" />
                  <span className="text-xs text-navy-100">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <FlowArrow />

        {/* AI + Result */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 bg-navy-800/50 border border-navy-700/50 rounded-xl px-4 py-2.5 justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white tracking-wide">AI / EXTERNAL SERVICES</span>
          </div>
        </div>
        <FlowArrow />
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-2.5 justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-300 tracking-wide">RESULT</span>
          </div>
        </div>
        <FlowArrow />
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 bg-navy-800/50 border border-navy-700/50 rounded-xl px-4 py-2.5 justify-center">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white tracking-wide">USER</span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// SLIDE 11 — DATABASE DESIGN
function Slide11() {
  const tables = [
    { icon: Users, name: 'users', fields: ['id', 'name', 'email', 'mobile', 'location', 'preferred_language'] },
    { icon: FileText, name: 'documents', fields: ['id', 'user_id', 'name', 'type', 'extracted_text', 'analysis'] },
    { icon: Calendar, name: 'reminders', fields: ['id', 'user_id', 'title', 'case_number', 'date', 'time', 'court'] },
    { icon: Gavel, name: 'court_cases', fields: ['id', 'user_id', 'case_name', 'status', 'notes'] },
    { icon: MessageSquare, name: 'chat_history', fields: ['id', 'user_id', 'title', 'created_at'] },
    { icon: BookOpen, name: 'legal_queries', fields: ['id', 'user_id', 'query', 'response', 'domain'] },
  ];

  return (
    <SlideShell>
      <SlideTag><Database className="w-3 h-3" /> Database Design</SlideTag>
      <SlideTitle>Relational database structure</SlideTitle>
      <SlideSubtitle>PostgreSQL stores all structured data with user-specific relationships.</SlideSubtitle>

      <div className="grid lg:grid-cols-3 gap-3">
        {/* Users table highlighted */}
        <Card className="border-gold-500/30 lg:row-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gold-400" />
            <h4 className="text-sm font-bold text-gold-400">users</h4>
          </div>
          <div className="space-y-1.5">
            {tables[0].fields.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${f === 'id' ? 'bg-gold-400' : 'bg-navy-500'}`} />
                <span className={f === 'id' ? 'text-gold-300 font-medium' : 'text-navy-200'}>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-navy-700/50">
            <p className="text-xs text-navy-400">Central user record</p>
          </div>
        </Card>

        {/* Other tables */}
        {tables.slice(1).map((table, i) => (
          <motion.div
            key={table.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <table.icon className="w-4 h-4 text-gold-400" />
                <h4 className="text-xs font-bold text-white">{table.name}</h4>
              </div>
              <div className="space-y-1">
                {table.fields.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <div className={`w-1 h-1 rounded-full ${f === 'user_id' ? 'bg-gold-400' : 'bg-navy-500'}`} />
                    <span className={f === 'user_id' ? 'text-gold-300 font-medium' : 'text-navy-300'}>{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-navy-400">
        <KeyRound className="w-3.5 h-3.5 text-gold-400" />
        <span>Each user has a unique account. All records are connected through user IDs. Documents, reminders, and chat history belong to individual users.</span>
      </div>
    </SlideShell>
  );
}

// SLIDE 12 — SECURITY & PRIVACY
function Slide12() {
  const securityItems = [
    { icon: Shield, label: 'Supabase Authentication', desc: 'Secure user authentication handled by Supabase Auth' },
    { icon: KeyRound, label: 'Secure Password Handling', desc: 'Passwords managed through the auth service, not stored in plain text' },
    { icon: Lock, label: 'Row Level Security', desc: 'Users can only access their own records' },
    { icon: FileText, label: 'Secure Document Storage', desc: 'Uploaded legal documents stored in private Supabase Storage' },
    { icon: Eye, label: 'Access Control', desc: 'Each user sees only their own documents and data' },
    { icon: Settings, label: 'Environment Variables', desc: 'Secret keys kept server-side, never exposed in frontend code' },
  ];

  return (
    <SlideShell>
      <SlideTag><Lock className="w-3 h-3" /> Security & Privacy</SlideTag>
      <SlideTitle>Security is part of the product</SlideTitle>
      <SlideSubtitle>Legal information is sensitive. JurisGuide is built with security at its core.</SlideSubtitle>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {securityItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                <p className="text-xs text-navy-400 mt-0.5">{item.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-gold-500/30 bg-gradient-to-r from-navy-800/60 to-navy-900/60">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-gold-400 flex-shrink-0" />
          <p className="text-base text-white font-medium">
            "Legal information is sensitive information, so security is part of the product — not an optional feature."
          </p>
        </div>
      </Card>
    </SlideShell>
  );
}

// SLIDE 13 — TECHNOLOGY STACK
function Slide13() {
  const stacks = [
    {
      icon: LayoutDashboard,
      title: 'Frontend',
      color: 'text-cyan-400',
      items: ['React', 'TypeScript', 'TSX', 'Tailwind CSS', 'Vite'],
    },
    {
      icon: Server,
      title: 'Backend / BaaS',
      color: 'text-gold-400',
      items: ['Supabase', 'Supabase Auth', 'PostgreSQL', 'Supabase Storage', 'Edge Functions'],
    },
    {
      icon: Settings,
      title: 'Development',
      color: 'text-teal-400',
      items: ['npm', 'Git / GitHub'],
    },
    {
      icon: Brain,
      title: 'AI Layer',
      color: 'text-purple-400',
      items: ['AI model / API', 'Document processing / OCR'],
    },
  ];

  return (
    <SlideShell>
      <SlideTag><Layers className="w-3 h-3" /> Technology Stack</SlideTag>
      <SlideTitle>Built with a modern, scalable stack</SlideTitle>

      <div className="grid sm:grid-cols-2 gap-4">
        {stacks.map((stack, i) => (
          <motion.div
            key={stack.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <stack.icon className={`w-5 h-5 ${stack.color}`} />
                <h4 className={`text-sm font-bold ${stack.color}`}>{stack.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {stack.items.map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-lg bg-navy-900/50 border border-navy-700/40 text-xs text-navy-100 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-navy-400">
        <AlertTriangle className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
        <span>AI provider details are abstracted through an edge function layer, allowing the AI model to be changed without affecting the frontend.</span>
      </div>
    </SlideShell>
  );
}

// SLIDE 14 — REAL-WORLD IMPACT
function Slide14() {
  const groups = [
    {
      icon: Users,
      title: 'For Citizens',
      color: 'text-cyan-400',
      items: [
        'Better legal awareness',
        'Easier document understanding',
        'Easier access to legal information',
        'Regional language support',
      ],
    },
    {
      icon: Gavel,
      title: 'For People in Court Matters',
      color: 'text-gold-400',
      items: [
        'Better understanding of procedures',
        'Hearing reminders',
        'Organized document storage',
      ],
    },
    {
      icon: Shield,
      title: 'For Society',
      color: 'text-teal-400',
      items: [
        'Improved legal literacy',
        'Better awareness of rights and duties',
        'Easier access to general legal information',
      ],
    },
  ];

  return (
    <SlideShell>
      <SlideTag><Heart className="w-3 h-3" /> Real-World Impact</SlideTag>
      <SlideTitle>How JurisGuide helps different people</SlideTitle>

      <div className="grid lg:grid-cols-3 gap-4">
        {groups.map((group, i) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
          >
            <Card className="h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center">
                  <group.icon className={`w-5 h-5 ${group.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white">{group.title}</h4>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-navy-200">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

// SLIDE 15 — FUTURE SCOPE & CONCLUSION
function Slide15() {
  const future = [
    'More Indian and regional languages',
    'Improved document OCR accuracy',
    'Better legal-domain-specific AI',
    'Integration with official legal information sources',
    'Court case tracking where legally feasible',
    'Lawyer and legal-aid referral',
    'Voice-based legal assistance',
    'Personalized legal information',
    'Advanced document risk detection',
  ];

  return (
    <SlideShell>
      <SlideTag><Sparkles className="w-3 h-3" /> Future Scope & Conclusion</SlideTag>
      <SlideTitle>Where JurisGuide goes next</SlideTitle>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Future scope */}
        <div>
          <h4 className="text-sm font-semibold text-gold-400 mb-3 uppercase tracking-wide">Future Possibilities</h4>
          <div className="space-y-2">
            {future.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                <span className="text-sm text-navy-200">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="flex flex-col justify-center gap-4">
          <Card className="border-gold-500/20 bg-gradient-to-br from-navy-800/60 to-navy-900/60">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <p className="text-base text-white font-medium leading-relaxed">
                "JurisGuide does not aim to replace lawyers. It aims to make legal information easier to understand before people take their next step."
              </p>
            </div>
          </Card>

          <div className="text-center py-4">
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-12 bg-gold-500/40" />
              <p className="text-lg font-bold text-gold-400 tracking-wide">
                Understand the law. Know your rights. Take informed decisions.
              </p>
              <div className="h-px w-12 bg-gold-500/40" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-navy-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>JurisGuide is an AI-powered legal information platform, not a substitute for professional legal advice.</span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
