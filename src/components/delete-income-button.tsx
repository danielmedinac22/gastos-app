"use client";

import { deleteIncome } from "@/actions/incomes";
import { MaterialIcon } from "@/components/ui/material-icon";

export function DeleteIncomeButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => deleteIncome(id)}
      className="text-on-surface-variant/30 hover:text-error transition-all duration-200 p-1.5 hover:bg-error-container/30 rounded-xl"
    >
      <MaterialIcon name="delete" className="text-lg" />
    </button>
  );
}
