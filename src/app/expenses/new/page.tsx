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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuevo gasto</h1>
      <ExpenseForm categories={categories} cards={cards} />
    </div>
  );
}
