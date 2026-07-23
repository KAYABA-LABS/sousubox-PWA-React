"use client";

import Link from "next/link";
import { forwardRef, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  activeClassName?: string;
  isActive?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, isActive, href, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn("inline-flex items-center justify-center", className, isActive && activeClassName)}
      >
        <Button variant="ghost" asChild className="p-0 h-auto">
          <span {...props} />
        </Button>
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
