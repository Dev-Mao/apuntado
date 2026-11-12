import { cn } from "@/lib";

import type { ChoicePillsProps } from "./types";

export function ChoicePills<T extends string>({ legend, name, options, value, onChange, className }: ChoicePillsProps<T>) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="label-caps mb-2 text-[0.65rem] text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "label-caps cursor-pointer rounded-full border-[1.5px] px-4 pt-[0.7rem] pb-[0.6rem] text-[0.65rem] transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coral-ink",
              option.value === value ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
