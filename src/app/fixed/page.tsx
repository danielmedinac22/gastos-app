import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FixedExpenseForm } from "@/components/fixed-expense-form";
import { DeleteFixedExpenseButton } from "@/components/delete-fixed-expense-button";
import { Repeat } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gastos fijos</h1>
        <Badge variant="secondary" className="text-sm">
          Total: {formatCurrency(totalFixed)}
        </Badge>
      </div>

      <FixedExpenseForm categories={categories} cards={cards} />

      {fixedExpenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Repeat className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay gastos fijos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {fixedExpenses.map((fe) => (
            <Card key={fe.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fe.category.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{fe.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Día {fe.dayOfMonth} de cada mes
                        {fe.creditCard && (
                          <span>
                            {" "}
                            · <span style={{ color: fe.creditCard.color }}>{fe.creditCard.name}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {formatCurrency(Number(fe.amount))}
                    </span>
                    <DeleteFixedExpenseButton id={fe.id} />
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
