"use client";

import { deleteFixedExpense } from "@/actions/fixed-expenses";
import { MaterialIcon } from "@/components/ui/material-icon";

export function DeleteFixedExpenseButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => deleteFixedExpense(id)}
      className="text-on-surface-variant/30 hover:text-error transition-all duration-200 p-1.5 hover:bg-error-container/30 rounded-xl"
    >
      <MaterialIcon name="delete" className="text-lg" />
    </button>
  );
}
