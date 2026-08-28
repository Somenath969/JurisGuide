import { Scale } from 'lucide-react';

export default function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-navy-700 dark:bg-navy-600 flex items-center justify-center shadow-md">
          <Scale className="w-5 h-5 text-gold-400" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-navy-800 dark:text-white">
          Juris<span className="text-gold-500">Guide</span>
        </span>
      )}
    </div>
  );
}
