import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IncomeEntryForm } from "@/components/income-entry-form";
import { DeleteIncomeButton } from "@/components/delete-income-button";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncomesPage() {
  const incomes = await prisma.income.findMany({
    where: { isActive: true },
    orderBy: { dayOfMonth: "asc" },
  });

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingresos</h1>
        <Badge variant="secondary" className="text-sm">
          Total: {formatCurrency(totalIncome)}
        </Badge>
      </div>

      <IncomeEntryForm />

      {incomes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay ingresos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {incomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{income.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Día {income.dayOfMonth} de cada mes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(Number(income.amount))}
                    </span>
                    <DeleteIncomeButton id={income.id} />
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
