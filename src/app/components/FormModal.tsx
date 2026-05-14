import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

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
  maxWidth = "sm:max-w-md",
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`rounded-2xl border border-zinc-200 shadow-xl p-0 w-[calc(100%-2rem)] ${maxWidth}`}>
        <div className="px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl">
          <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            {titleIcon}
            {title}
          </DialogTitle>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
