import { type ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function FormModal({
  open,
  onClose,
  title,
  titleIcon,
  children,
  footer,
  maxWidth = "max-w-md",
}: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm px-4">
      <div className={`bg-white rounded-2xl border border-zinc-200 shadow-xl w-full ${maxWidth}`}>
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
