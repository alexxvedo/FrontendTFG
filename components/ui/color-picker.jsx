"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  { id: "gradient", value: "gradient", label: "Gradiente", className: "bg-gradient-to-r from-blue-600 to-purple-600" },
  { id: "blue", value: "#3b82f6", label: "Azul", className: "bg-blue-500" },
  { id: "purple", value: "#8b5cf6", label: "Púrpura", className: "bg-purple-500" },
  { id: "pink", value: "#ec4899", label: "Rosa", className: "bg-pink-500" },
  { id: "red", value: "#ef4444", label: "Rojo", className: "bg-red-500" },
  { id: "orange", value: "#f97316", label: "Naranja", className: "bg-orange-500" },
  { id: "yellow", value: "#eab308", label: "Amarillo", className: "bg-yellow-500" },
  { id: "green", value: "#22c55e", label: "Verde", className: "bg-green-500" },
  { id: "teal", value: "#14b8a6", label: "Turquesa", className: "bg-teal-500" },
  { id: "cyan", value: "#06b6d4", label: "Cian", className: "bg-cyan-500" },
  { id: "indigo", value: "#6366f1", label: "Índigo", className: "bg-indigo-500" },
  { id: "violet", value: "#8b5cf6", label: "Violeta", className: "bg-violet-500" },
];

export function ColorPicker({ value, onChange }) {
  const [selectedColor, setSelectedColor] = useState(value || "gradient");

  useEffect(() => {
    if (value) {
      setSelectedColor(value);
    }
  }, [value]);

  const handleColorChange = (colorValue) => {
    setSelectedColor(colorValue);
    onChange(colorValue);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          aria-label={`Color ${color.label}`}
          title={color.label}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-purple-500",
            color.className
          )}
          onClick={() => handleColorChange(color.value)}
        >
          {selectedColor === color.value && (
            <Check className="h-4 w-4 text-white" />
          )}
        </button>
      ))}
    </div>
  );
}
