import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          h-10 w-full min-w-0 rounded-xl border
          border-black/10 dark:border-white/10

          bg-white/80 dark:bg-[#1c2128]/80
          backdrop-blur-xl

          px-3 py-2

          text-base text-black dark:text-white
          placeholder:text-zinc-400 dark:placeholder:text-zinc-500

          shadow-sm dark:shadow-black/20

          outline-none
          transition-all duration-300

          file:inline-flex
          file:h-7
          file:border-0
          file:bg-transparent
          file:text-sm
          file:font-medium
          file:text-foreground

          selection:bg-primary
          selection:text-primary-foreground

          disabled:pointer-events-none
          disabled:cursor-not-allowed
          disabled:opacity-50

          md:text-sm
        `,
        `
          focus-visible:border-orange-500
          focus-visible:ring-4
          focus-visible:ring-orange-500/20
        `,
        `
          aria-invalid:border-destructive
          aria-invalid:ring-destructive/20
          dark:aria-invalid:ring-destructive/40
        `,
        className
      )}
      {...props}
    />
  );
}

export { Input };