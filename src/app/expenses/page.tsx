import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { buttonVariants } from "@/components/ui/button-variants";
import Link from "next/link";
import { DeleteExpenseButton } from "@/components/delete-expense-button";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { category: true, creditCard: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  // Group expenses by date
  const grouped = expenses.reduce<Record<string, typeof expenses>>((acc, expense) => {
    const key = formatDate(expense.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            Historial
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Gastos
          </h1>
        </div>
        <Link href="/expenses/new" className={buttonVariants({ variant: "gradient", size: "sm" })}>
          <MaterialIcon name="add" className="text-base mr-0.5" />
          Nuevo
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="receipt_long" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">No hay gastos registrados</p>
          <Link href="/expenses/new" className="text-sm text-primary font-semibold underline mt-2 inline-block">
            Registrar primer gasto
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2 px-1">
                {date}
              </p>
              <div className="space-y-2">
                {items.map((expense) => (
                  <div
                    key={expense.id}
                    className="group bg-surface-container-lowest rounded-2xl p-4 editorial-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary-fixed/50 flex items-center justify-center text-lg">
                        {expense.category.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {expense.description || expense.category.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {expense.creditCard && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block mr-0.5"
                                style={{ backgroundColor: expense.creditCard.color }}
                              />
                              {expense.creditCard.name}
                            </Badge>
                          )}
                          {expense.paymentMethod === "CASH" && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                              Efectivo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-base font-bold tracking-tight">
                        {formatCurrency(Number(expense.amount))}
                      </span>
                      <DeleteExpenseButton id={expense.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
