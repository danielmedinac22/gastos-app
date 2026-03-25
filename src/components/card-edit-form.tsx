"use client";

import { useRef, useState } from "react";
import { updateCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";

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
      <button
        onClick={() => setOpen(true)}
        className="text-on-surface-variant hover:text-primary transition-all duration-200 p-2 hover:bg-primary-fixed/30 rounded-xl"
      >
        <MaterialIcon name="edit" className="text-lg" />
      </button>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-5 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon name="edit" className="text-lg text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Editar tarjeta
        </span>
      </div>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="edit-name">Nombre</Label>
          <Input id="edit-name" name="name" defaultValue={card.name} required className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="edit-cutOff">Día de corte</Label>
            <Input
              id="edit-cutOff"
              name="cutOffDay"
              type="number"
              min="1"
              max="31"
              defaultValue={card.cutOffDay}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-payment">Día de pago</Label>
            <Input
              id="edit-payment"
              name="paymentDay"
              type="number"
              min="1"
              max="31"
              defaultValue={card.paymentDay}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-limit">Cupo (opcional)</Label>
          <Input
            id="edit-limit"
            name="creditLimit"
            type="number"
            step="1"
            min="0"
            defaultValue={card.creditLimit ?? ""}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex gap-3 mt-2">
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
                  className="w-8 h-8 rounded-full peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-checked:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="gradient" size="sm" className="flex-1">Guardar</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
