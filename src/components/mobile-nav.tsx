"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

const navItems = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/expenses", label: "Gastos", icon: "receipt_long" },
  { href: "/expenses/new", label: "Agregar", icon: "add_circle", isAction: true },
  { href: "/cards", label: "Tarjetas", icon: "credit_card" },
  { href: "/cash-flow", label: "Flujo", icon: "account_balance_wallet" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav rounded-t-3xl editorial-shadow">
      <div className="max-w-lg mx-auto flex items-center justify-around h-20 pb-2">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center -mt-4 active:scale-90 transition-all duration-200"
              >
                <MaterialIcon
                  name={item.icon}
                  fill
                  className="text-primary text-4xl"
                />
                <span className="text-[9px] font-medium uppercase tracking-widest text-primary mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90",
                isActive ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <MaterialIcon
                name={item.icon}
                fill={isActive}
                className="text-2xl"
              />
              <span className={cn(
                "text-[9px] uppercase tracking-widest",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
