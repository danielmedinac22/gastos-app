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
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-2xl">
        <button
          onClick={() => setTab("flow")}
          className={`flex-1 text-sm py-2 px-3 rounded-xl transition-all duration-200 ${
            tab === "flow"
              ? "bg-surface-container-lowest font-semibold shadow-sm text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Flujo de pago
        </button>
        <button
          onClick={() => setTab("expenses")}
          className={`flex-1 text-sm py-2 px-3 rounded-xl transition-all duration-200 ${
            tab === "expenses"
              ? "bg-surface-container-lowest font-semibold shadow-sm text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Gastos por mes
        </button>
      </div>

      {tab === "flow" ? flowContent : expensesContent}
    </>
  );
}
