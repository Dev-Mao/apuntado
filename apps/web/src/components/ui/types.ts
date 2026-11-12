import type { ComponentProps, ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  closeLabel: string;
  dismissible?: boolean | undefined;
  onClose: () => void;
  className?: string | undefined;
  children: ReactNode;
}

export type FieldTone = "paper" | "ink";

export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  tone?: FieldTone | undefined;
  hint?: string | undefined;
  error?: string | undefined;
}

export interface ChoiceOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface ChoicePillsProps<T extends string> {
  legend: string;
  name: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string | undefined;
}
