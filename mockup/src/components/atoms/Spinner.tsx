import React from "react";

interface SpinnerProps {
  size?: "S" | "M" | "L";
  className?: string;
}

const sizeMap: Record<string, string> = {
  S: "w-4 h-4 border-2",
  M: "w-6 h-6 border-2",
  L: "w-8 h-8 border-[3px]",
};

export const Spinner: React.FC<SpinnerProps> = ({ size = "M", className = "" }) => {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-key-background1 border-t-transparent ${sizeMap[size]} ${className}`}
      role="status"
      aria-busy="true"
    />
  );
};
