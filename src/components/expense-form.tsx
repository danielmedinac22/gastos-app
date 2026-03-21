"use client";

import { useRef } from "react";
import { createExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; icon: string };
type CreditCardOption = { id: string; name: string; color: string };

export function ExpenseForm({
  categories,
  cards,
}: {
  categories: Category[];
  cards: CreditCardOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createExpense(formData);
    formRef.current?.reset();
    router.push("/expenses");
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              required
              autoFocus
              className="text-2xl font-bold h-14"
            />
          </div>

          {/* Category */}
          <div>
            <Label>Categoría</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {categories.map((cat, i) => (
                <label key={cat.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="categoryId"
                    value={cat.id}
                    className="peer sr-only"
                    defaultChecked={i === 0}
                    required
                  />
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted transition-colors">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {cat.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label>Método de pago</Label>
            <div className="flex gap-2 mt-1">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="text-center py-2 rounded-lg border peer-checked:border-primary peer-checked:bg-primary/5 transition-colors text-sm">
                  Efectivo
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  className="peer sr-only"
                />
                <div className="text-center py-2 rounded-lg border peer-checked:border-primary peer-checked:bg-primary/5 transition-colors text-sm">
                  Tarjeta
                </div>
              </label>
            </div>
          </div>

          {/* Card selector (shown when CARD selected via CSS) */}
          {cards.length > 0 && (
            <div>
              <Label htmlFor="creditCardId">Tarjeta</Label>
              <select
                id="creditCardId"
                name="creditCardId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar tarjeta</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ej: Almuerzo con amigos"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base">
            Guardar gasto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
