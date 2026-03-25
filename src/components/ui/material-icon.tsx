import { cn } from "@/lib/utils"

export function MaterialIcon({
  name,
  fill,
  className,
}: {
  name: string
  fill?: boolean
  className?: string
}) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
