'use client';

import { ReactNode } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

interface DownloadOptionsProps {
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
  disabled?: boolean;
}

export function DownloadOptions({ onDownloadPDF, onDownloadImage, disabled = false }: DownloadOptionsProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Download Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onDownloadPDF}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" /> Download as PDF
        </button>
        <button
          onClick={onDownloadImage}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5" /> Save as Image
        </button>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function FormField({ label, name, type = 'text', value, onChange, required = false, placeholder, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all font-sans"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function FormSelect({ label, name, value, onChange, options, className = '' }: FormSelectProps) {
  return (
    <div className={className}>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all font-sans appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PreviewContainer({ children, previewId, hasPreview }: { children: ReactNode, previewId: string, hasPreview: boolean }) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0e0e14] p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-white/10 overflow-y-auto max-h-[800px] shadow-inner custom-scrollbar relative">
      {!hasPreview ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm font-medium">
          Fill the form to generate a preview.
        </div>
      ) : (
        <div id={previewId} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-gray-800 mx-auto max-w-3xl transform origin-top w-full">
          {children}
        </div>
      )}
    </div>
  );
}