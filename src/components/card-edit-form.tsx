"use client";

import { useRef, useState } from "react";
import { updateCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
];

type Props = {
  card: {
    id: string;
    name: string;
    cutOffDay: number;
    paymentDay: number;
    color: string;
    creditLimit: number | null;
  };
};

export function CardEditForm({ card }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await updateCard(card.id, formData);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Pencil className="h-3 w-3" />
        Editar
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Editar tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="edit-name" className="text-xs">Nombre</Label>
            <Input id="edit-name" name="name" defaultValue={card.name} required className="h-9 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="edit-cutOff" className="text-xs">Día de corte</Label>
              <Input
                id="edit-cutOff"
                name="cutOffDay"
                type="number"
                min="1"
                max="31"
                defaultValue={card.cutOffDay}
                required
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-payment" className="text-xs">Día de pago</Label>
              <Input
                id="edit-payment"
                name="paymentDay"
                type="number"
                min="1"
                max="31"
                defaultValue={card.paymentDay}
                required
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-limit" className="text-xs">Cupo (opcional)</Label>
            <Input
              id="edit-limit"
              name="creditLimit"
              type="number"
              step="1"
              min="0"
              defaultValue={card.creditLimit ?? ""}
              className="h-9 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 mt-1">
              {COLORS.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    className="peer sr-only"
                    defaultChecked={color === card.color}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">Guardar</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
