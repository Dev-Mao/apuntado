import { cn } from "@/lib";

import type { ComponentProps } from "react";

export const BUTTON_VARIANT = {
  PRIMARY: "primary",
  OUTLINE: "outline",
  DARK: "dark",
  LIGHT: "light",
  GHOST: "ghost",
} as const;

export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    "bg-coral text-ink shadow-[inset_0_0_0_1.5px_var(--color-salmon),0_10px_22px_-12px_rgb(168_69_44/0.8)] not-disabled:hover:bg-coral-deep",
  outline: "border-[1.5px] border-ink text-ink not-disabled:hover:bg-ink not-disabled:hover:text-paper",
  dark: "bg-ink text-paper not-disabled:hover:bg-ink-soft",
  light: "border-[1.5px] border-paper/60 text-paper not-disabled:hover:bg-paper not-disabled:hover:text-ink",
  ghost: "text-ink underline-offset-4 not-disabled:hover:underline",
};

const BASE_CLASSES =
  "label-caps inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full px-6 pt-[0.8rem] pb-[0.7rem] text-xs whitespace-nowrap transition-[background-color,color,border-color,scale] duration-200 ease-glide not-disabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 max-sm:tracking-[0.14em]";

export function buttonClasses(variant: ButtonVariant = BUTTON_VARIANT.PRIMARY, className?: string): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
