import { AlertTriangle } from 'lucide-react';

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gold-50 dark:bg-navy-900/50 border border-gold-200 dark:border-navy-700 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
        <p>
          JurisGuide is an AI-powered legal information tool. It is not a substitute for professional legal advice.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gold-50 dark:bg-navy-900/50 border border-gold-200 dark:border-navy-700 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
      <p>
        <strong className="text-navy-800 dark:text-white">Disclaimer:</strong> JurisGuide is an AI-powered legal information and document-understanding tool.
        It is not a substitute for a qualified lawyer or professional legal advice. Users should consult a qualified
        legal professional for advice specific to their situation.
      </p>
    </div>
  );
}
