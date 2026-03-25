import { CardForm } from "@/components/card-form";

export default function NewCardPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
          Agregar
        </p>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Nueva tarjeta
        </h1>
      </div>
      <CardForm />
    </div>
  );
}
