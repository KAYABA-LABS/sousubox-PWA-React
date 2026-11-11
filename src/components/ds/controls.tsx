"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "light" | "outline" | "ghostOnHero" | "dangerOutline";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-sb-brand-900 text-white hover:bg-sb-brand-800 dark:bg-sb-brand-700 dark:hover:bg-sb-brand-600",
  light: "bg-white text-sb-brand-950 hover:bg-white/90",
  outline: "border border-sb-line-strong bg-sb-surface text-sb-ink hover:bg-sb-surface-2",
  ghostOnHero: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
  dangerOutline: "border border-sb-danger/30 bg-sb-surface text-sb-danger hover:bg-sb-danger-tint",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/** Shared class list so links and buttons render identically. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap",
    "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-brand-500",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

interface ActionContentProps {
  icon?: LucideIcon;
  trailingArrow?: boolean;
  children: ReactNode;
}

/** Inner layout for a button: optional leading icon, label, optional trailing arrow. */
function ActionContent({ icon: Icon, trailingArrow, children }: ActionContentProps) {
  return (
    <>
      {Icon && <Icon aria-hidden="true" className="size-4" strokeWidth={2} />}
      <span>{children}</span>
      {trailingArrow && <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />}
    </>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  trailingArrow?: boolean;
}

/** Pill button in one of the design's variants. */
export function Button({ variant, size, icon, trailingArrow, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...props}>
      <ActionContent icon={icon} trailingArrow={trailingArrow}>
        {children}
      </ActionContent>
    </button>
  );
}

interface LinkButtonProps extends Omit<ButtonProps, "type" | "onClick"> {
  href: string;
}

/** Pill-shaped navigation link that looks like a Button. */
export function LinkButton({ href, variant, size, icon, trailingArrow, className, children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      <ActionContent icon={icon} trailingArrow={trailingArrow}>
        {children}
      </ActionContent>
    </Link>
  );
}

/** Small green "See all →" style text link used in card and section headers. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-[14px] font-semibold text-sb-brand-600 hover:text-sb-brand-700",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-brand-500 dark:hover:text-sb-brand-400",
        className
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
    </Link>
  );
}

interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

/** Single-select pill filter row (plan filters, pool tabs, chart ranges). */
export function ChipGroup<T extends string>({ label, options, value, onChange, size = "md", className }: ChipGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full font-semibold transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-brand-500",
              size === "sm" ? "h-7 px-3 text-[12px]" : "h-9 px-4 text-[13px]",
              active
                ? "bg-sb-brand-900 text-white dark:bg-sb-brand-700"
                : "border border-sb-line-strong bg-sb-surface text-sb-ink-2 hover:text-sb-ink"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Accessible on/off switch styled like the Settings screen toggles. */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-brand-500 disabled:opacity-50",
        checked ? "bg-sb-brand-600" : "bg-sb-line-strong"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[19px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
