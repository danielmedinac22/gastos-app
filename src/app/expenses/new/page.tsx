import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "@/components/expense-form";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const [categories, cards] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.creditCard.findMany({
      where: { isActive: true },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
          Registrar
        </p>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Nuevo gasto
        </h1>
      </div>
      <ExpenseForm categories={categories} cards={cards} />
    </div>
  );
}
