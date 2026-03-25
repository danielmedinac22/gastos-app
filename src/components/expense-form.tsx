"use client";

import { useRef, useState } from "react";
import { createExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
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
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "custom">("today");

  async function handleSubmit(formData: FormData) {
    await createExpense(formData);
    formRef.current?.reset();
    router.push("/expenses");
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div className="text-center py-4">
        <Label htmlFor="amount">Monto</Label>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="font-headline text-3xl font-bold text-primary">$</span>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            required
            autoFocus
            className="font-headline text-5xl font-extrabold tracking-tighter text-center bg-transparent h-auto py-2 w-full max-w-[280px] border-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label>Categoría</Label>
        <div className="grid grid-cols-5 gap-y-4 gap-x-2 mt-3">
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
              <div className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-xl peer-checked:bg-primary peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all duration-200">
                  {cat.icon}
                </div>
                <span className="text-[9px] font-medium text-on-surface-variant truncate w-full text-center uppercase tracking-wider">
                  {cat.name}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <Label>Fecha</Label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setDateMode("today")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              dateMode === "today"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setDateMode("yesterday")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              dateMode === "yesterday"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={() => setDateMode("custom")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
              dateMode === "custom"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <MaterialIcon name="calendar_today" className="text-sm" />
            Otro
          </button>
        </div>
        {dateMode === "custom" && (
          <Input
            id="date-custom"
            name="date"
            type="date"
            className="mt-2"
            required
          />
        )}
        {dateMode !== "custom" && (
          <input
            type="hidden"
            name="date"
            value={dateMode === "today" ? today : yesterday}
          />
        )}
      </div>

      {/* Payment Method */}
      <div>
        <Label>Método de pago</Label>
        <div className="flex gap-3 mt-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              className="peer sr-only"
              defaultChecked
            />
            <div className="text-center py-3 rounded-2xl bg-surface-container-low text-sm font-medium transition-all duration-200 peer-checked:bg-surface-container-lowest peer-checked:editorial-shadow peer-checked:ring-2 peer-checked:ring-primary/15">
              <MaterialIcon name="payments" className="text-xl block mx-auto mb-1" />
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
            <div className="text-center py-3 rounded-2xl bg-surface-container-low text-sm font-medium transition-all duration-200 peer-checked:bg-surface-container-lowest peer-checked:editorial-shadow peer-checked:ring-2 peer-checked:ring-primary/15">
              <MaterialIcon name="credit_card" className="text-xl block mx-auto mb-1" />
              Tarjeta
            </div>
          </label>
        </div>
      </div>

      {/* Card selector */}
      {cards.length > 0 && (
        <div>
          <Label htmlFor="creditCardId">Tarjeta</Label>
          <select
            id="creditCardId"
            name="creditCardId"
            className="flex h-12 w-full rounded-xl border-none bg-surface-container-low px-4 py-2 text-sm text-on-surface mt-2 outline-none focus:ring-2 focus:ring-primary/20"
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
          className="mt-2"
        />
      </div>

      <Button type="submit" variant="gradient" className="w-full h-14 text-base uppercase tracking-widest">
        Guardar gasto
      </Button>
    </form>
  );
}
