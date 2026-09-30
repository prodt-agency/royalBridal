import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  labelledBy,
}) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const requestClose = () => closeRef.current?.();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4"
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        className={clsx(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
          "sm:max-h-[88vh]",
          SIZES[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id={labelledBy}
              className="font-serif text-lg font-bold break-words text-stone-900"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs break-words text-stone-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close dialog"
            className="-mr-1.5 -mt-1 shrink-0 rounded-md p-2.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminModal;