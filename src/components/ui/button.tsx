import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/components/ui/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "light" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#8b4255] bg-[#8b4255] text-white! hover:border-[#713445] hover:bg-[#713445]",
  secondary:
    "border-[#8b4255] bg-transparent text-[#8b4255]! hover:bg-[#8b4255] hover:text-white!",
  ghost:
    "border-transparent bg-transparent text-[#2b1e20]! hover:bg-[#f6e7e5]",
  inverse:
    "border-white/75 bg-transparent text-white! hover:border-white hover:bg-white hover:text-[#542735]!",
  light:
    "border-white bg-white text-[#542735]! hover:border-[#f8e5e8] hover:bg-[#f8e5e8]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-xs",
  md: "min-h-12 px-6 text-sm",
  lg: "min-h-14 px-8 text-sm",
};

export function buttonStyles({
  className,
  fullWidth = false,
  size = "md",
  variant = "primary",
}: {
  className?: string;
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border font-semibold uppercase tracking-[0.16em] transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, fullWidth, size, type = "button", variant, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ className, fullWidth, size, variant })}
      {...props}
    />
  );
});
