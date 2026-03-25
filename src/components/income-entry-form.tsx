"use client";

import { useRef } from "react";
import { createIncome } from "@/actions/incomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";

export function IncomeEntryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createIncome(formData);
    formRef.current?.reset();
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon name="add" className="text-lg text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Agregar ingreso
        </span>
      </div>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="inc-name">Nombre</Label>
            <Input id="inc-name" name="name" placeholder="Salario" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="inc-amount">Monto</Label>
            <Input id="inc-amount" name="amount" type="number" step="1" min="0" placeholder="0" required className="mt-1" />
          </div>
        </div>

        <div>
          <Label htmlFor="inc-day">Día del mes</Label>
          <Input id="inc-day" name="dayOfMonth" type="number" min="1" max="31" placeholder="15" required className="mt-1" />
        </div>

        <Button type="submit" variant="gradient" className="w-full h-11">
          Agregar
        </Button>
      </form>
    </div>
  );
}
