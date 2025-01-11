import clsx from "clsx";
import { type ButtonHTMLAttributes, type DetailedHTMLProps } from "react";

interface ButtonProps
  extends React.PropsWithChildren<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  > {
  variant?: "primary" | "secondary" | "outline" | "link";
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
      className={clsx("rounded-md", className, {
        "py-3 px-8 font-medium": size === "lg",
        "py-2 px-3 text-sm font-semibold": size === "md",
        "w-6 h-6 border": size === "icon",
        "": variant === "primary",
        "": variant === "secondary",
        "": variant === "outline",
      })}
      {...props}
    >
      {children}
    </button>
  );
}
