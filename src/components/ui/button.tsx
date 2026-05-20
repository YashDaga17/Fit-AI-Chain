import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2
    whitespace-nowrap rounded-xl
    text-sm font-medium

    transition-all duration-300

    disabled:pointer-events-none
    disabled:opacity-50

    outline-none

    focus-visible:ring-4
    focus-visible:ring-orange-500/20
    focus-visible:border-orange-500

    aria-invalid:border-destructive
    aria-invalid:ring-destructive/20
    dark:aria-invalid:ring-destructive/40

    [&_svg]:pointer-events-none
    [&_svg:not([class*='size-'])]:size-4
    shrink-0
    [&_svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        default: `
          bg-gradient-to-r
          from-orange-500
          to-red-600

          text-white

          shadow-lg shadow-orange-500/20

          hover:scale-[1.02]
          hover:opacity-95
        `,

        destructive: `
          bg-destructive
          text-white

          hover:bg-destructive/90

          focus-visible:ring-destructive/20
          dark:focus-visible:ring-destructive/40
        `,

        outline: `
          border
          border-black/10 dark:border-white/10

          bg-white/80 dark:bg-[#161b22]/80

          text-black dark:text-white

          backdrop-blur-xl

          shadow-sm dark:shadow-black/20

          hover:bg-zinc-100
          dark:hover:bg-white/5
        `,

        secondary: `
          bg-secondary
          text-secondary-foreground

          hover:bg-secondary/80
        `,

        ghost: `
          text-zinc-700
          dark:text-zinc-300

          hover:bg-zinc-100
          hover:text-black

          dark:hover:bg-white/10
          dark:hover:text-white
        `,

        link: `
          text-primary
          underline-offset-4
          hover:underline
        `,
      },

      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 px-3 gap-1.5 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };