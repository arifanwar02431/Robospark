"use client";

import { useState } from "react";
import { BellOff, Check, Plus } from "lucide-react";
import { Badge, cn } from "@/components/ui";
import { reminderLabel } from "@/lib/date";

export function ReminderPicker({
  value,
  onChange,
  presets,
  max,
}: {
  value: number[];
  onChange: (days: number[]) => void;
  presets: number[];
  max: number;
}) {
  const [custom, setCustom] = useState("");
  const options = [...new Set([...presets, ...value])].sort((a, b) => a - b);

  const toggle = (d: number) =>
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => b - a));

  const addCustom = () => {
    const n = Number(custom);
    if (custom === "" || !Number.isInteger(n) || n < 0 || n > max) return;
    if (!value.includes(n)) onChange([...value, n].sort((a, b) => b - a));
    setCustom("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((d) => {
          const selected = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              aria-pressed={selected}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ring-1 ring-inset transition-colors",
                selected
                  ? "bg-brand-50 text-brand-700 ring-brand-300"
                  : "bg-white text-gray-700 shadow-xs ring-gray-200 hover:bg-gray-50",
              )}
            >
              {selected && <Check className="size-3.5" strokeWidth={3} />}
              {reminderLabel(d)}
            </button>
          );
        })}
        <div className="inline-flex h-9 items-stretch overflow-hidden rounded-full bg-white shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-brand-500">
          <span className="flex items-center pl-3.5 text-[13px] font-semibold text-gray-500">H-</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={max}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="…"
            aria-label="Hari pengingat lain"
            className="w-10 bg-transparent px-1 text-[13px] font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={addCustom}
            className="flex items-center px-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            aria-label="Tambah pengingat"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      {value.length === 0 && (
        <Badge color="warning" className="self-start">
          <BellOff className="size-3" /> Tanpa pengingat Telegram
        </Badge>
      )}
    </div>
  );
}

export function ReminderBadges({ days }: { days: number[] }) {
  if (days.length === 0) return <span className="text-sm text-gray-400">Tanpa pengingat</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {[...days].sort((a, b) => b - a).map((d) => (
        <Badge key={d} color="brand">
          {reminderLabel(d)}
        </Badge>
      ))}
    </div>
  );
}
