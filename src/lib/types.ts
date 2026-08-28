export interface Profile {
  id: string;
  full_name: string;
  mobile: string;
  location: string;
  preferred_language: string;
  is_admin: boolean;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  name: string;
  type: string;
  folder: string;
  storage_path: string | null;
  extracted_text: string | null;
  analysis: DocumentAnalysis | null;
  risk_level: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface CaseInformation {
  caseName: string;
  court: string;
  caseNumber: string;
  date: string;
  parties: string;
  judgeBench: string;
  documentType: string;
}

export interface RiskAssessment {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  factors: string[];
}

export interface EvidenceItem {
  claim: string;
  page: string;
  excerpt: string;
}

export interface KeyDate {
  label: string;
  date: string;
}

export interface ImportantProvision {
  name: string;
  meaning: string;
}

export interface LegalIssue {
  issue: string;
  explanation: string;
}

export interface DocumentAnalysis {
  documentSummary: string;
  caseInformation: CaseInformation;
  riskAssessment: RiskAssessment;
  simpleMeaning: string;
  legalIssues: LegalIssue[];
  courtDecision: string;
  importantProvisions: ImportantProvision[];
  evidence: EvidenceItem[];
  keyDates: KeyDate[];
  actionItems: string[];
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  document_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  saved: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  case_number: string;
  court: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  notified: boolean;
  created_at: string;
}

export const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংलা" },
  { code: "ta", name: "Tamil", native: "தमिल்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "agreement", label: "Agreement" },
  { value: "property", label: "Property Document" },
  { value: "court_notice", label: "Court Notice" },
  { value: "other", label: "Other" },
] as const;

export const FOLDERS = [
  "Property",
  "Agreements",
  "Court Documents",
  "Personal Documents",
] as const;
