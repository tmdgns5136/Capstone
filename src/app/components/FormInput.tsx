import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

interface BaseFormFieldProps {
  label?: string;
  labelIcon?: ReactNode;
}

type FormInputProps = BaseFormFieldProps & InputHTMLAttributes<HTMLInputElement>;

export function FormInput({ label, labelIcon, className = "", ...props }: FormInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 block flex items-center gap-1">
          {labelIcon}
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
          props.disabled ? "bg-zinc-50 cursor-not-allowed opacity-60" : ""
        } ${className}`}
      />
    </div>
  );
}

type FormTextareaProps = BaseFormFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextarea({ label, labelIcon, className = "", ...props }: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 block flex items-center gap-1">
          {labelIcon}
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${className}`}
      />
    </div>
  );
}

type FormSelectProps = BaseFormFieldProps & SelectHTMLAttributes<HTMLSelectElement>;

export function FormSelect({ label, labelIcon, className = "", children, ...props }: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 block flex items-center gap-1">
          {labelIcon}
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${className}`}
      >
        {children}
      </select>
    </div>
  );
}
