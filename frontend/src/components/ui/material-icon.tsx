import { cn } from "@/lib/utils"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: number | string
  color?: string
}

export function Icon({ name, className, size, color, style, ...props }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined shrink-0", className)}
      style={{
        fontSize: size ? (typeof size === "number" ? `${size}px` : size) : undefined,
        color: color,
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  )
}
