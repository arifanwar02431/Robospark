// Komponen dasar tema "planner hangat". Bisa dipakai di server maupun client component.
import type { ComponentProps, ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ---------- Button (pill) ----------
type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "destructive-secondary";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,box-shadow,color] outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55";
const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_1px_2px_rgba(196,79,14,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-brand-700 focus-visible:ring-brand-200",
  secondary:
    "bg-white text-gray-800 shadow-xs ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus-visible:ring-gray-200",
  tertiary: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-200",
  destructive: "bg-error-600 text-white shadow-xs hover:bg-error-700 focus-visible:ring-error-100",
  "destructive-secondary":
    "bg-white text-error-700 shadow-xs ring-1 ring-inset ring-error-200 hover:bg-error-50 focus-visible:ring-error-100",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-[18px] text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; icon?: LucideIcon }) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  tone = "gray",
  className,
  ...props
}: ComponentProps<"button"> & { icon: LucideIcon; label: string; tone?: "gray" | "error" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-4",
        tone === "error"
          ? "text-gray-400 hover:bg-error-50 hover:text-error-600 focus-visible:ring-error-100"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-gray-200",
        className,
      )}
      {...props}
    >
      <Icon className="size-4" />
    </button>
  );
}

// ---------- Form ----------
const fieldBase =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-base text-gray-900 shadow-xs ring-1 ring-inset ring-gray-200 outline-none transition placeholder:text-gray-400 hover:ring-gray-300 focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm";

export function Input({ className, invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input className={cn(fieldBase, invalid && "ring-error-300 focus:ring-error-500", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        fieldBase,
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%237d756e%22 stroke-width=%221.8%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M5 7.5l5 5 5-5%22/></svg>')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-gray-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-error-600">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

// ---------- Badge & chips ----------
type BadgeColor = "gray" | "brand" | "success" | "warning" | "error" | "blue";
const badgeColors: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-600",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  error: "bg-error-50 text-error-700",
  blue: "bg-c1-50 text-c1-900",
};
const dotColors: Record<BadgeColor, string> = {
  gray: "bg-gray-400",
  brand: "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  blue: "bg-c1-500",
};

export function Badge({
  color = "gray",
  dot,
  children,
  className,
}: {
  color?: BadgeColor;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        badgeColors[color],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotColors[color])} />}
      {children}
    </span>
  );
}

/** Chip waktu kecil (mis. 07:30) */
export function TimeChip({ children, className, accent }: { children: ReactNode; className?: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums",
        accent ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------- Segmented control ----------
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number }[];
  className?: string;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex rounded-full bg-gray-100 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn("text-[11px] tabular-nums", active ? "text-brand-600" : "text-gray-400")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Card & layout ----------
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl bg-white shadow-xs ring-1 ring-gray-200/80", className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-tight text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const iconColors = {
  brand: "bg-brand-50 text-brand-600",
  gray: "bg-gray-100 text-gray-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
  blue: "bg-c1-50 text-c1-500",
} as const;

export function FeaturedIcon({
  icon: Icon,
  color = "brand",
  size = "md",
}: {
  icon: LucideIcon;
  color?: keyof typeof iconColors;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "size-8 rounded-lg [&>svg]:size-4", md: "size-10 rounded-xl [&>svg]:size-5", lg: "size-12 rounded-2xl [&>svg]:size-6" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", iconColors[color], sizes)}>
      <Icon strokeWidth={2} />
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.025em] text-gray-900 sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <FeaturedIcon icon={icon} size="lg" />
      <h3 className="mt-4 text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Alert({
  color = "warning",
  icon: Icon,
  title,
  children,
  action,
}: {
  color?: "warning" | "error" | "success" | "brand";
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const colors = {
    warning: "bg-warning-50 ring-warning-200 [&_.alert-icon]:text-warning-600",
    error: "bg-error-50 ring-error-200 [&_.alert-icon]:text-error-600",
    success: "bg-success-50 ring-success-200 [&_.alert-icon]:text-success-600",
    brand: "bg-brand-50 ring-brand-100 [&_.alert-icon]:text-brand-600",
  }[color];
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl p-4 ring-1 sm:flex-row sm:items-center", colors)}>
      <Icon className="alert-icon size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {children && <div className="mt-0.5 text-sm text-gray-600">{children}</div>}
      </div>
      {action}
    </div>
  );
}
