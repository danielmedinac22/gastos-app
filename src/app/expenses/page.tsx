import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteExpenseButton } from "@/components/delete-expense-button";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { category: true, creditCard: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <Link href="/expenses/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo
        </Link>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No hay gastos registrados</p>
            <Link href="/expenses/new" className="text-sm text-primary underline mt-1 inline-block">
              Registrar primer gasto
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{expense.category.icon}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {expense.description || expense.category.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(expense.date)}</span>
                        {expense.creditCard && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <span
                              className="w-2 h-2 rounded-full inline-block mr-1"
                              style={{ backgroundColor: expense.creditCard.color }}
                            />
                            {expense.creditCard.name}
                          </Badge>
                        )}
                        {expense.paymentMethod === "CASH" && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Efectivo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                    <DeleteExpenseButton id={expense.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
