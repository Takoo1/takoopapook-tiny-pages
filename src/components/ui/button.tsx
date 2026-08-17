import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_4px_12px_-4px_hsl(var(--primary)/0.35)] hover:brightness-105 hover:shadow-[0_2px_4px_hsl(var(--foreground)/0.08),0_8px_20px_-6px_hsl(var(--primary)/0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_4px_12px_-4px_hsl(var(--destructive)/0.4)] hover:brightness-105",
        outline:
          "border border-primary/30 bg-card text-primary hover:bg-secondary hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary/70 hover:text-primary text-primary",
        link: "text-primary underline-offset-4 hover:underline rounded-none active:scale-100",
        gold:
          "bg-[image:var(--gradient-gold)] text-[hsl(var(--navy))] hover:brightness-[1.03] shadow-[0_2px_4px_hsl(var(--foreground)/0.06),0_8px_20px_-8px_hsl(var(--lottery-gold)/0.55)] font-bold",
        lottery:
          "bg-[image:var(--gradient-gold)] text-[hsl(var(--navy))] hover:brightness-[1.03] shadow-[var(--shadow-glow)] font-bold",
        "lottery-outline":
          "border border-lottery-gold text-[hsl(var(--lottery-gold))] hover:bg-[hsl(var(--lottery-gold)/0.12)] bg-transparent",

      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
