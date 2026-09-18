"use client";

import { CLASS_COLORS } from "@/lib/colors";

// A row of preset color circles. `value` highlights the current selection;
// clicking a swatch calls onSelect(colorKey).
export default function ColorSwatchPicker({ value, onSelect }) {
  return (
    <div className="color-swatch-picker">
      {CLASS_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`color-swatch class-color-${color} ${
            value === color ? "selected" : ""
          }`}
          onClick={() => onSelect(color)}
          aria-label={`Use ${color}`}
          aria-pressed={value === color}
        />
      ))}
    </div>
  );
}
