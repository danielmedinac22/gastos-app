"use client";

import { useState, type ReactNode } from "react";

type Props = {
  flowContent: ReactNode;
  expensesContent: ReactNode;
};

export function CashFlowTabs({ flowContent, expensesContent }: Props) {
  const [tab, setTab] = useState<"flow" | "expenses">("flow");

  return (
    <>
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setTab("flow")}
          className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${
            tab === "flow"
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Flujo de pago
        </button>
        <button
          onClick={() => setTab("expenses")}
          className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${
            tab === "expenses"
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Gastos por mes
        </button>
      </div>

      {tab === "flow" ? flowContent : expensesContent}
    </>
  );
}
