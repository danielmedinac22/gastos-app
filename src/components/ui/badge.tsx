import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary-fixed text-primary [a]:hover:bg-primary-fixed/80",
        secondary:
          "bg-surface-container-highest text-on-surface-variant [a]:hover:bg-surface-container-high",
        destructive:
          "bg-error-container/30 text-error focus-visible:ring-error/20 [a]:hover:bg-error-container/50",
        outline:
          "border-outline-variant/15 text-on-surface-variant",
        ghost:
          "hover:bg-surface-container-low hover:text-on-surface-variant",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-tertiary-fixed/30 text-tertiary [a]:hover:bg-tertiary-fixed/50",
        warning:
          "bg-warning-light text-warning [a]:hover:bg-warning-light/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
