import { cn } from "@/lib";

import type { ComponentProps } from "react";

export const BUTTON_VARIANT = {
  PRIMARY: "primary",
  OUTLINE: "outline",
  DARK: "dark",
  LIGHT: "light",
  GHOST: "ghost",
  DANGER: "danger",
} as const;

export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    "border-2 border-ink bg-coral text-ink shadow-stamp not-disabled:hover:-translate-y-px not-disabled:hover:bg-coral-deep not-disabled:active:translate-x-[3px] not-disabled:active:translate-y-[3px] not-disabled:active:shadow-none",
  outline:
    "border-2 border-ink bg-paper-light text-ink shadow-stamp not-disabled:hover:-translate-y-px not-disabled:hover:bg-peach not-disabled:active:translate-x-[3px] not-disabled:active:translate-y-[3px] not-disabled:active:shadow-none",
  dark: "bg-ink text-paper not-disabled:hover:bg-ink-soft",
  light: "border-[1.5px] border-paper/60 text-paper not-disabled:hover:bg-paper not-disabled:hover:text-ink",
  ghost: "text-ink underline-offset-4 not-disabled:hover:underline",
  danger:
    "border-2 border-ink bg-coral-ink text-paper shadow-stamp not-disabled:hover:-translate-y-px not-disabled:hover:bg-ink not-disabled:active:translate-x-[3px] not-disabled:active:translate-y-[3px] not-disabled:active:shadow-none",
};

const BASE_CLASSES =
  "label-caps inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full px-6 py-[0.7rem] text-xs whitespace-nowrap transition-[background-color,color,border-color,translate,box-shadow] duration-150 ease-glide disabled:cursor-not-allowed disabled:opacity-40 max-sm:tracking-[0.14em]";

export function buttonClasses(variant: ButtonVariant = BUTTON_VARIANT.PRIMARY, className?: string): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
