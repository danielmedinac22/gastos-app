"use client";

import { updateIncome } from "@/actions/fixed-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Pencil, Check } from "lucide-react";

export function IncomeForm({ currentIncome }: { currentIncome: number }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <Card>
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Ingreso mensual</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(currentIncome)}
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <form
          action={async (formData) => {
            await updateIncome(formData);
            setEditing(false);
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Ingreso mensual</p>
            <Input
              name="monthlyIncome"
              type="number"
              step="1"
              min="0"
              defaultValue={currentIncome || ""}
              placeholder="0"
              autoFocus
              className="h-10"
            />
          </div>
          <Button type="submit" size="icon">
            <Check className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
