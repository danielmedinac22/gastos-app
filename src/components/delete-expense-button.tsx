"use client";

import { deleteExpense } from "@/actions/expenses";
import { Trash2 } from "lucide-react";

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => deleteExpense(id)}
      className="text-muted-foreground hover:text-destructive transition-colors p-1"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
