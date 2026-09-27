import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export default function Field({ label, hint, id, className = "", ...rest }: Props) {
  const inputId = id || rest.name;
  return (
    <label htmlFor={inputId} className={`block ${className}`}>
      <span className="block text-sm font-medium text-ink-800">{label}</span>
      <input
        id={inputId}
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100 transition"
      />
      {hint && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}
