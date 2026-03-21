"use client";

import { useRef } from "react";
import { createCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="pt-4">
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la tarjeta</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Visa Bancolombia"
              required
              autoFocus
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
            />
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
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
                    className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base">
            Crear tarjeta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
