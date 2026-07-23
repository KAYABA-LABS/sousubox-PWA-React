import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface AuthInputProps {
  label?: string;
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  autoFocus?: boolean;
}

export function AuthInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  autoFocus,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-10 ${error ? "border-red-500" : ""}`}
          autoFocus={autoFocus}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
