import Link from "next/link";

import { cn } from "@/lib";

import type { ComponentProps } from "react";

export const BUTTON_VARIANT = {
  PRIMARY: "primary",
  OUTLINE: "outline",
  OUTLINE_LIGHT: "outline-light",
  GHOST: "ghost",
} as const;

export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary: "border-coral bg-coral text-ink hover:bg-coral-deep hover:border-coral-deep",
  outline: "border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border-paper/70 text-paper hover:bg-paper hover:text-ink",
  ghost: "border-transparent text-ink underline-offset-4 hover:underline",
};

const BASE_CLASSES =
  "label-caps inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] px-6 pt-[0.8rem] pb-[0.7rem] text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export function buttonClasses(variant: ButtonVariant = BUTTON_VARIANT.PRIMARY, className?: string): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
