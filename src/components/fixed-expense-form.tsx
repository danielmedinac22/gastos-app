"use client";

import { useRef } from "react";
import { createFixedExpense } from "@/actions/fixed-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";

type Category = { id: string; name: string; icon: string };
type CreditCardOption = { id: string; name: string; color: string };

export function FixedExpenseForm({
  categories,
  cards,
}: {
  categories: Category[];
  cards: CreditCardOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createFixedExpense(formData);
    formRef.current?.reset();
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon name="add" className="text-lg text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Agregar gasto fijo
        </span>
      </div>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fe-name">Nombre</Label>
            <Input id="fe-name" name="name" placeholder="Netflix" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="fe-amount">Monto</Label>
            <Input id="fe-amount" name="amount" type="number" step="1" min="0" placeholder="0" required className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fe-day">Día del mes</Label>
            <Input id="fe-day" name="dayOfMonth" type="number" min="1" max="31" placeholder="1" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="fe-category">Categoría</Label>
            <select
              id="fe-category"
              name="categoryId"
              required
              className="flex h-10 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-2 text-sm text-on-surface mt-1 outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Método</Label>
            <div className="flex gap-2 mt-1">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="paymentMethod" value="CASH" className="peer sr-only" defaultChecked />
                <div className="text-center py-2 rounded-xl bg-surface-container-lowest text-xs font-medium transition-all peer-checked:ring-2 peer-checked:ring-primary/15 peer-checked:editorial-shadow">
                  Efectivo
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="paymentMethod" value="CARD" className="peer sr-only" />
                <div className="text-center py-2 rounded-xl bg-surface-container-lowest text-xs font-medium transition-all peer-checked:ring-2 peer-checked:ring-primary/15 peer-checked:editorial-shadow">
                  Tarjeta
                </div>
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="fe-card">Tarjeta</Label>
            <select
              id="fe-card"
              name="creditCardId"
              className="flex h-10 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-2 text-sm text-on-surface mt-1 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Ninguna</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full h-11">
          Agregar
        </Button>
      </form>
    </div>
  );
}
