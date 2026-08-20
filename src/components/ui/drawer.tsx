"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/components/ui/cn";

export function Drawer({
  children,
  closeLabel = "Close",
  description,
  footer,
  onClose,
  open,
  side = "right",
  title,
}: {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  side?: "left" | "right";
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={cn(
        "fixed inset-y-0 m-0 h-dvh max-h-none w-[min(100%,30rem)] overflow-hidden border-0 bg-[#fffaf4] p-0 text-[#2b1e20] shadow-2xl backdrop:bg-[#2b1e20]/45 backdrop:backdrop-blur-[2px]",
        side === "right" ? "ml-auto" : "mr-auto",
      )}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[#dfc9c4] px-5 py-5 sm:px-7">
          <div>
            <h2 id={titleId} className="font-serif text-3xl leading-none tracking-tight">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-[#705e5b]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#dfc9c4] bg-white text-[#2b1e20] transition-colors hover:bg-[#f6e7e5] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-2"
            onClick={onClose}
          >
            <X aria-hidden="true" size={19} strokeWidth={1.7} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? (
          <footer className="border-t border-[#dfc9c4] bg-[#fffaf4] px-5 py-5 sm:px-7">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
