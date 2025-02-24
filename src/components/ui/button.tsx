import { cn } from "@/utils/cn";
import { type ButtonHTMLAttributes, type DetailedHTMLProps } from "react";

interface ButtonProps
  extends React.PropsWithChildren<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  > {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "lg" | "md" | "icon";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md",
        {
          "py-3 px-8 font-medium": size === "lg",
          "py-2 px-3 text-sm font-semibold": size === "md",
          "w-6 h-6 border": size === "icon",
          "text-gray-50 bg-gray-900": variant === "primary",
          "text-gray-900 bg-gray-200": variant === "secondary",
          "": variant === "outline",
          "text-gray-500 bg-transparent": variant === "ghost",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
