"use client";

import { useRef } from "react";
import { createFixedExpense } from "@/actions/fixed-expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1">
          <Plus className="h-4 w-4" /> Agregar gasto fijo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="fe-name" className="text-xs">Nombre</Label>
              <Input id="fe-name" name="name" placeholder="Netflix" required className="h-9 text-sm" />
            </div>
            <div>
              <Label htmlFor="fe-amount" className="text-xs">Monto</Label>
              <Input id="fe-amount" name="amount" type="number" step="1" min="0" placeholder="0" required className="h-9 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="fe-day" className="text-xs">Día del mes</Label>
              <Input id="fe-day" name="dayOfMonth" type="number" min="1" max="28" placeholder="1" required className="h-9 text-sm" />
            </div>
            <div>
              <Label htmlFor="fe-category" className="text-xs">Categoría</Label>
              <select id="fe-category" name="categoryId" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Método</Label>
              <div className="flex gap-1 mt-1">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="CASH" className="peer sr-only" defaultChecked />
                  <div className="text-center py-1.5 rounded border text-xs peer-checked:border-primary peer-checked:bg-primary/5">Efectivo</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="CARD" className="peer sr-only" />
                  <div className="text-center py-1.5 rounded border text-xs peer-checked:border-primary peer-checked:bg-primary/5">Tarjeta</div>
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="fe-card" className="text-xs">Tarjeta</Label>
              <select id="fe-card" name="creditCardId" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option value="">Ninguna</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" size="sm" className="w-full">
            Agregar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
