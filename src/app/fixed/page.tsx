import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { FixedExpenseForm } from "@/components/fixed-expense-form";
import { DeleteFixedExpenseButton } from "@/components/delete-fixed-expense-button";

export const dynamic = "force-dynamic";

export default async function FixedExpensesPage() {
  const [fixedExpenses, categories, cards] = await Promise.all([
    prisma.fixedExpense.findMany({
      where: { isActive: true },
      include: { category: true, creditCard: true },
      orderBy: { dayOfMonth: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.creditCard.findMany({
      where: { isActive: true },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const totalFixed = fixedExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            Recurrentes
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Gastos fijos
          </h1>
        </div>
        <Badge variant="default" className="text-sm px-3 py-1 h-auto font-headline font-bold">
          {formatCurrency(totalFixed)}
        </Badge>
      </div>

      <FixedExpenseForm categories={categories} cards={cards} />

      {fixedExpenses.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="repeat" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">No hay gastos fijos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fixedExpenses.map((fe) => (
            <div
              key={fe.id}
              className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed/50 flex items-center justify-center text-xl">
                  {fe.category.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{fe.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    Día {fe.dayOfMonth} de cada mes
                    {fe.creditCard && (
                      <span>
                        {" "}· <span style={{ color: fe.creditCard.color }}>{fe.creditCard.name}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-base font-bold tracking-tight">
                  {formatCurrency(Number(fe.amount))}
                </span>
                <DeleteFixedExpenseButton id={fe.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
