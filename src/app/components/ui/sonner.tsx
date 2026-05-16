import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      position="top-center"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] backdrop-blur-sm font-[Outfit,sans-serif]",
          title: "text-sm font-medium leading-snug",
          description: "text-xs leading-relaxed mt-0.5",
          success:
            "bg-primary/10 border-primary/60 text-primary-dark [&_[data-icon]]:text-primary-dark",
          error:
            "bg-rose-50/95 border-rose-200/60 text-rose-800 [&_[data-icon]]:text-rose-500",
          warning:
            "bg-amber-50/95 border-amber-200/60 text-amber-800 [&_[data-icon]]:text-amber-500",
          info: "bg-sky-50/95 border-sky-200/60 text-sky-800 [&_[data-icon]]:text-sky-500",
          default:
            "bg-white/95 border-zinc-200/60 text-zinc-800 [&_[data-icon]]:text-zinc-400",
          actionButton:
            "text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors",
          cancelButton:
            "text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors",
          closeButton:
            "!bg-transparent !border-0 !text-current opacity-40 hover:opacity-100 transition-opacity !shadow-none",
        },
      }}
    />
  );
};

export { Toaster };
