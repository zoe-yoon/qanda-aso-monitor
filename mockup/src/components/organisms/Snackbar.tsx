import React, { useEffect } from "react";
import { Icon } from "@/components/atoms/Icon";

interface SnackbarProps {
  message: string;
  variant?: "default" | "error";
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant = "default",
  visible,
  onDismiss,
  duration = 3000,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2 text-[14px] font-semibold leading-[20px]
          ${variant === "error"
            ? "bg-negative-background1 text-negative-foreground1"
            : "bg-background-selectable1 text-foreground-on-neutral"
          }`}
      >
        {variant === "error" ? (
          <Icon name="IconExclamationCircle" size={20} />
        ) : (
          <Icon name="IconCheckCircle" size={20} />
        )}
        {message}
        <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer">
          <Icon name="IconX" size={16} />
        </button>
      </div>
    </div>
  );
};
