import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button-default",
      secondary: "ui-button-secondary",
      ghost: "ui-button-ghost",
      export: "ui-button-export"
    },
    size: {
      default: "ui-button-md",
      sm: "ui-button-sm",
      lg: "ui-button-lg"
    },
    full: {
      true: "ui-button-full"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

function Button({ className, variant, size, full, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, full, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
