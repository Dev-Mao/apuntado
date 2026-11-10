import type { ComponentProps, ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  className?: string | undefined;
  children: ReactNode;
}

export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
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
