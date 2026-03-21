"use client";

import { useRef } from "react";
import { createIncome } from "@/actions/incomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function IncomeEntryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createIncome(formData);
    formRef.current?.reset();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1">
          <Plus className="h-4 w-4" /> Agregar ingreso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="inc-name" className="text-xs">Nombre</Label>
              <Input id="inc-name" name="name" placeholder="Salario" required className="h-9 text-sm" />
            </div>
            <div>
              <Label htmlFor="inc-amount" className="text-xs">Monto</Label>
              <Input id="inc-amount" name="amount" type="number" step="1" min="0" placeholder="0" required className="h-9 text-sm" />
            </div>
          </div>

          <div>
            <Label htmlFor="inc-day" className="text-xs">Día del mes</Label>
            <Input id="inc-day" name="dayOfMonth" type="number" min="1" max="31" placeholder="15" required className="h-9 text-sm" />
          </div>

          <Button type="submit" size="sm" className="w-full">
            Agregar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
