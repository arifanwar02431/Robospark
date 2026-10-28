"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { FeaturedIcon, cn } from "./ui";

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  iconColor = "brand",
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: "brand" | "error" | "success" | "warning" | "gray" | "blue";
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Fokus ke input pertama agar bisa langsung mengetik.
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button[data-autofocus]");
      el?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-gray-900/45 backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-pop-in flex-col rounded-t-3xl bg-white shadow-xl ring-1 ring-black/5 sm:rounded-3xl",
          { sm: "sm:max-w-[400px]", md: "sm:max-w-[560px]", lg: "sm:max-w-[680px]" }[size],
        )}
      >
        <div className="flex items-start gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          {icon && <FeaturedIcon icon={icon} color={iconColor} />}
          <div className="min-w-0 flex-1 pr-8">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-5 pt-5 pb-1 sm:px-6">{children}</div>}
        {footer && <div className="flex flex-col-reverse gap-3 px-5 pt-6 pb-5 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">{footer}</div>}
      </div>
    </div>
  );
}
