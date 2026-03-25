"use client";

import { useRef } from "react";
import { createCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
];

export function CardForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createCard(formData);
    formRef.current?.reset();
    router.push("/cards");
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-6">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la tarjeta</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ej: Visa Bancolombia"
            required
            autoFocus
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cutOffDay">Día de corte</Label>
            <Input
              id="cutOffDay"
              name="cutOffDay"
              type="number"
              min="1"
              max="31"
              placeholder="15"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="paymentDay">Día de pago</Label>
            <Input
              id="paymentDay"
              name="paymentDay"
              type="number"
              min="1"
              max="31"
              placeholder="5"
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="creditLimit">Cupo (opcional)</Label>
          <Input
            id="creditLimit"
            name="creditLimit"
            type="number"
            step="1"
            min="0"
            placeholder="5000000"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex gap-3 mt-2">
            {COLORS.map((color, i) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  className="peer sr-only"
                  defaultChecked={i === 0}
                />
                <div
                  className="w-10 h-10 rounded-full peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-checked:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full h-14 text-base uppercase tracking-widest">
          Crear tarjeta
        </Button>
      </form>
    </div>
  );
}
