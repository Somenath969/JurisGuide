import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, AlertCircle, CheckCircle2,
  Info, AlertTriangle, ShieldAlert, Sparkles, ArrowLeft,
  ListChecks, BookOpen, Lightbulb, ScanLine, FileSearch,
  Brain, RotateCcw, Calendar, Gavel, Scale, ClipboardList,
  CheckSquare, FileWarning, Quote,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import type { DocumentAnalysis } from '@/lib/types';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'png', 'jpg', 'jpeg'];
const ALLOWED_MIME = [
  'application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg',
];

type PipelineStep = 'upload' | 'detect' | 'extract' | 'analyze' | 'issues' | 'explain' | 'risk' | 'results';

const PIPELINE_STEPS: { key: PipelineStep; label: string; icon: typeof Upload; desc: string }[] = [
  { key: 'upload', label: 'Uploading document', icon: Upload, desc: 'Saving your file securely' },
  { key: 'detect', label: 'Detecting document type', icon: FileText, desc: 'Checking if OCR is needed' },
  { key: 'extract', label: 'Extracting text / OCR', icon: ScanLine, desc: 'Reading the document content' },
  { key: 'analyze', label: 'AI analysis', icon: Brain, desc: 'Understanding the document with AI' },
  { key: 'issues', label: 'Identifying legal issues', icon: ListChecks, desc: 'Finding key legal questions' },
  { key: 'explain', label: 'Explaining in plain language', icon: Sparkles, desc: 'Converting legal terms to simple words' },
  { key: 'risk', label: 'Assessing document risk', icon: AlertTriangle, desc: 'Evaluating risk level' },
  { key: 'results', label: 'Preparing results', icon: CheckCircle2, desc: 'Organizing the analysis' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read this file.'));
        return;
      }
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read this file. It may be corrupted.'));
    reader.readAsDataURL(file);
  });
}

function validateFile(file: File): string | null {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const isAllowedMime = ALLOWED_MIME.includes(file.type);
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
  if (!isAllowedMime && !isAllowedExt) {
    return 'Unsupported file type. Please upload a PDF, TXT, PNG, or JPG file.';
  }
  if (file.size === 0) {
    return 'This file appears to be empty. Please choose a valid document.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'This file is too large. Please upload a file smaller than 15 MB.';
  }
  return null;
}

const riskStyles: Record<string, { bg: string; text: string; border: string; icon: typeof ShieldAlert }> = {
  LOW: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: CheckCircle2 },
  MEDIUM: { bg: 'bg-gold-50 dark:bg-gold-950/30', text: 'text-gold-700 dark:text-gold-400', border: 'border-gold-200 dark:border-gold-800', icon: AlertTriangle },
  HIGH: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', icon: ShieldAlert },
  CRITICAL: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: ShieldAlert },
};

export default function AnalyzeDocumentPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('other');
  const [docFolder, setDocFolder] = useState('Personal Documents');
  const [activeStep, setActiveStep] = useState<PipelineStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<PipelineStep[]>([]);
  const [failedStep, setFailedStep] = useState<PipelineStep | null>(null);
  const [view, setView] = useState<'upload' | 'pipeline' | 'results' | 'error'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setFile(f);
    setDocName(f.name.replace(/\.[^.]+$/, ''));
    setError('');
    setAnalysis(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const runPipelineStep = async (step: PipelineStep, delayMs: number) => {
    setActiveStep(step);
    await new Promise((r) => setTimeout(r, delayMs));
    setCompletedSteps((prev) => [...prev, step]);
  };

  const uploadAndAnalyze = async () => {
    if (!file) {
      setError('Please upload a document file first.');
      return;
    }

    setLoading(true);
    setError('');
    setView('pipeline');
    setCompletedSteps([]);
    setFailedStep(null);
    setActiveStep(null);

    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    try {
      // Step 1: Upload
      await runPipelineStep('upload', 500);

      let storagePath: string | null = null;
      if (user) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
        } else {
          storagePath = filePath;
        }
      }

      // Step 2: Detect type
      await runPipelineStep('detect', 400);

      // Step 3: Extract text / OCR (the AI handles this via vision)
      await runPipelineStep('extract', 800);

      const fileData = await fileToBase64(file);
      if (!fileData || fileData.length < 10) {
        setFailedStep('extract');
        throw new Error('Unable to extract readable text from this document. Please upload a clearer document or a searchable PDF.');
      }

      // Create document record
      let docId: string | null = null;
      if (user) {
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: docName || file.name,
            type: docType,
            folder: docFolder,
            storage_path: storagePath,
            extracted_text: null,
            language,
          })
          .select()
          .single();
        if (docError) {
          console.error('Document record error:', docError);
        } else if (doc) {
          docId = doc.id;
        }
      }

      // Step 4: AI analysis
      await runPipelineStep('analyze', 600);

      // Call edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setFailedStep('analyze');
        throw new Error('Your session has expired. Please sign in again and retry.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            documentId: docId,
            file: {
              name: file.name,
              mimeType: file.type || 'application/octet-stream',
              data: fileData,
            },
            language,
          }),
        }
      );

      if (!response.ok) {
        setFailedStep('analyze');
        let errMsg = `Analysis failed (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // response body wasn't JSON
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.error) {
        setFailedStep('analyze');
        throw new Error(data.error);
      }
      if (!data.analysis) {
        setFailedStep('analyze');
        throw new Error('The AI service returned an empty result. Please try again.');
      }

      // Steps 5-8: post-processing animation
      await runPipelineStep('issues', 400);
      await runPipelineStep('explain', 400);
      await runPipelineStep('risk', 400);
      await runPipelineStep('results', 400);

      setActiveStep(null);
      setAnalysis(data.analysis as DocumentAnalysis);
      setView('results');
    } catch (err) {
      const message = (err as Error).message || 'Failed to analyze document. Please try again.';
      console.error('Analyze error:', message);
      setError(message);
      setView('error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setError('');
    setDocName('');
    setActiveStep(null);
    setCompletedSteps([]);
    setFailedStep(null);
    setView('upload');
  };

  const retry = () => {
    setError('');
    setFailedStep(null);
    setCompletedSteps([]);
    setView('upload');
  };

  const isImageFile = file && (file.type.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(file.name));
  const isPdfFile = file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {(view === 'results' || view === 'error') && (
          <button onClick={reset} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Analyze Document</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload a legal document and AI will explain it in simple language</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Processing Pipeline ─── */}
        {view === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-7 h-7 text-navy-500 dark:text-navy-300 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">AI is analyzing your document</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Explaining everything in simple, easy-to-understand language...</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              {PIPELINE_STEPS.map((step, i) => {
                const isCompleted = completedSteps.includes(step.key);
                const isActive = activeStep === step.key;
                const isFailed = failedStep === step.key;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isFailed
                        ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
                        : isCompleted
                        ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20'
                        : isActive
                        ? 'border-navy-400 dark:border-navy-500 bg-navy-50 dark:bg-navy-800/40 scale-[1.01]'
                        : 'border-gray-100 dark:border-navy-700/50 bg-gray-50 dark:bg-navy-800/20 opacity-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isFailed ? 'bg-red-500/20' : isCompleted ? 'bg-green-500/20' : isActive ? 'bg-navy-500/20' : 'bg-gray-200 dark:bg-navy-700'
                    }`}>
                      {isFailed ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-navy-500 dark:text-navy-300 animate-spin" />
                      ) : (
                        <step.icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isFailed ? 'text-red-700 dark:text-red-400'
                        : isCompleted ? 'text-green-700 dark:text-green-400'
                        : isActive ? 'text-navy-800 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}>{step.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{step.desc}</p>
                    </div>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Upload Form ─── */}
        {view === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Upload zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                dragOver
                  ? 'border-navy-500 bg-navy-50 dark:bg-navy-800/50 scale-[1.01]'
                  : 'border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="w-16 h-16 rounded-2xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-navy-500 dark:text-navy-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                {file ? file.name : 'Upload your legal document'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Just upload the file — AI will read and explain it for you'}
              </p>
              {(isImageFile || isPdfFile) && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-600 dark:text-blue-400">
                  <ScanLine className="w-3.5 h-3.5" />
                  OCR will be used to extract text from this file
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary mt-4 text-sm"
              >
                <FileText className="w-4 h-4" /> Choose File
              </button>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                Supported: PDF, TXT, PNG, JPG — Max 15 MB
              </p>
            </div>

            {/* Document metadata */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-navy-900 dark:text-white text-sm">Document Details</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="Document name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="input-field !py-2 text-sm"
                  >
                    <option value="contract">Contract</option>
                    <option value="agreement">Agreement</option>
                    <option value="property">Property Document</option>
                    <option value="court_notice">Court Notice</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Folder</label>
                  <select
                    value={docFolder}
                    onChange={(e) => setDocFolder(e.target.value)}
                    className="input-field !py-2 text-sm"
                  >
                    <option>Property</option>
                    <option>Agreements</option>
                    <option>Court Documents</option>
                    <option>Personal Documents</option>
                  </select>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="card p-5 bg-navy-50/50 dark:bg-navy-800/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-semibold text-navy-900 dark:text-white text-sm">How it works</h3>
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                {[
                  { icon: Upload, label: '1. Upload file', desc: 'Just select your document' },
                  { icon: Brain, label: '2. AI reads it', desc: 'AI processes the full document' },
                  { icon: Sparkles, label: '3. Simple explanation', desc: 'Legal terms explained plainly' },
                  { icon: AlertTriangle, label: '4. Risk highlights', desc: 'Important clauses flagged' },
                ].map((step) => (
                  <div key={step.label} className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 flex items-center justify-center mx-auto mb-2">
                      <step.icon className="w-5 h-5 text-navy-500 dark:text-navy-300" />
                    </div>
                    <p className="text-xs font-medium text-navy-800 dark:text-white">{step.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={uploadAndAnalyze}
              disabled={loading || !file}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Analyze with AI
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ─── Error State ─── */}
        {view === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Analysis Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={retry} className="btn-primary">
                <RotateCcw className="w-4 h-4" /> Retry Analysis
              </button>
              <button onClick={reset} className="btn-secondary">
                <Upload className="w-4 h-4" /> Upload Different File
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Results ─── */}
        {view === 'results' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Document header + risk badge */}
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{docName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI Analysis Complete</p>
                </div>
                {(() => {
                  const level = analysis.riskAssessment.level;
                  const rs = riskStyles[level] || riskStyles.LOW;
                  return (
                    <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${rs.bg} ${rs.text} ${rs.border} border`}>
                      <rs.icon className="w-4 h-4" />
                      {level} RISK
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.documentSummary}</p>
            </div>

            {/* Case Information */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                <h3 className="font-semibold text-navy-900 dark:text-white">Case Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Case Name', value: analysis.caseInformation.caseName },
                  { label: 'Court', value: analysis.caseInformation.court },
                  { label: 'Case Number', value: analysis.caseInformation.caseNumber },
                  { label: 'Date of Judgment/Order', value: analysis.caseInformation.date },
                  { label: 'Parties', value: analysis.caseInformation.parties },
                  { label: 'Judge / Bench', value: analysis.caseInformation.judgeBench },
                  { label: 'Document Type', value: analysis.caseInformation.documentType },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-navy-800 dark:text-white mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Meaning */}
            <div className="card p-6 border-l-4 border-l-gold-500">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="font-semibold text-navy-900 dark:text-white">Simple Meaning</h3>
              </div>
              <p className="text-sm text-navy-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.simpleMeaning}</p>
            </div>

            {/* Risk Assessment */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                <h3 className="font-semibold text-navy-900 dark:text-white">Risk Assessment</h3>
              </div>
              {(() => {
                const level = analysis.riskAssessment.level;
                const rs = riskStyles[level] || riskStyles.LOW;
                return (
                  <div className={`p-4 rounded-xl ${rs.bg} ${rs.border} border mb-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <rs.icon className={`w-5 h-5 ${rs.text}`} />
                      <span className={`text-base font-bold ${rs.text}`}>{level}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.riskAssessment.reason}</p>
                  </div>
                );
              })()}
              {analysis.riskAssessment.factors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Risk Factors</p>
                  <ul className="space-y-1.5">
                    {analysis.riskAssessment.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-700 dark:text-gray-300">
                        <AlertTriangle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-4">
                AI-generated document risk assessment — not legal advice.
              </p>
            </div>

            {/* Legal Issues */}
            {analysis.legalIssues.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Important Legal Issues</h3>
                </div>
                <div className="space-y-3">
                  {analysis.legalIssues.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                      <p className="text-sm font-medium text-navy-800 dark:text-white">{item.issue}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Court Decision */}
            {analysis.courtDecision && analysis.courtDecision !== 'Not found in document' && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gavel className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Court Decision / Order</h3>
                </div>
                <p className="text-sm text-navy-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.courtDecision}</p>
              </div>
            )}

            {/* Important Provisions */}
            {analysis.importantProvisions.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Important Sections / Clauses</h3>
                </div>
                <div className="space-y-3">
                  {analysis.importantProvisions.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                      <p className="text-sm font-medium text-navy-800 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence / Proof */}
            {analysis.evidence.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Evidence / Proof</h3>
                </div>
                <div className="space-y-3">
                  {analysis.evidence.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Claim</p>
                        <p className="text-sm text-navy-800 dark:text-white mt-0.5">{item.claim}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Source</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.page}</p>
                      </div>
                      {item.excerpt && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Evidence</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 italic">"{item.excerpt}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Dates */}
            {analysis.keyDates.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                  <h3 className="font-semibold text-navy-900 dark:text-white">Key Dates</h3>
                </div>
                <div className="space-y-2">
                  {analysis.keyDates.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-navy-800/50">
                      <Calendar className="w-4 h-4 text-gold-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-navy-800 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-navy-600 dark:text-navy-300" />
                <h3 className="font-semibold text-navy-900 dark:text-white">Action Items</h3>
              </div>
              {analysis.actionItems.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy-700 dark:text-gray-300">
                      <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No specific action items identified in this document.</p>
              )}
            </div>

            {/* Disclaimer */}
            <div className="card p-4 bg-gray-50 dark:bg-navy-800/30 border border-gray-200 dark:border-navy-700/50">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  This analysis is generated by AI for informational purposes only and does not constitute legal advice. Always consult a qualified legal professional for advice regarding your specific situation.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary">
                <RotateCcw className="w-4 h-4" /> Analyze Another Document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
