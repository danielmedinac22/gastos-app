"use client";

import { deleteIncome } from "@/actions/incomes";
import { Trash2 } from "lucide-react";

export function DeleteIncomeButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => deleteIncome(id)}
      className="text-muted-foreground hover:text-destructive transition-colors p-1"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
