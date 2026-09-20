import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Product: ["Features", "Security", "Pricing", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "Help Center", "Contact", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container px-4 md:px-6 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg text-white bg-[#0D4F3C] flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  V
                </span>
              </div>
              <span className="font-semibold text-lg text-foreground">
                Vaulta
              </span>
            </a>
            <p className="text-sm text-gray-900/60 mb-4 max-w-xs">
              Your premium digital account for managing funds with clarity and
              confidence.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-900/60">
              <Shield className="w-4 h-4 text-[#0D4F3C]" />
              <span>Bank-level security</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Button
                      variant="ghost"
                      asChild
                      className="h-auto p-0 text-sm text-gray-900/60 hover:text-[#0D4F3C] transition-colors"
                    >
                      <a href="#">{link}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vaulta. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <Button
                key={social}
                variant="ghost"
                asChild
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <a href="#">{social}</a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
