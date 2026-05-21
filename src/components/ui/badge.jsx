import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge-default",
      success: "ui-badge-success",
      muted: "ui-badge-muted"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
