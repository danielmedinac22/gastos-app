import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IncomeForm } from "@/components/income-form";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Repeat } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [settings, expenses, fixedExpenses, cardPayments] = await Promise.all([
    prisma.settings.findFirst({ where: { id: "default" } }),
    prisma.expense.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        fixedExpenseId: null,
      },
      _sum: { amount: true },
    }),
    prisma.fixedExpense.findMany({
      where: { isActive: true },
      select: { amount: true },
    }),
    prisma.billingCycle.findMany({
      where: {
        isPaid: false,
        isClosed: true,
        paymentDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { totalAmount: true },
    }),
  ]);

  const income = Number(settings?.monthlyIncome ?? 0);
  const variableExpenses = Number(expenses._sum.amount ?? 0);
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCardPayments = cardPayments.reduce(
    (sum, c) => sum + Number(c.totalAmount),
    0
  );
  const totalExpenses = variableExpenses + totalFixed + totalCardPayments;
  const available = income - totalExpenses;

  const monthName = new Intl.DateTimeFormat("es-CO", { month: "long" }).format(now);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Flujo de caja</h1>
      <p className="text-sm text-muted-foreground capitalize">{monthName} {now.getFullYear()}</p>

      {/* Income setting */}
      <IncomeForm currentIncome={income} />

      {/* Flow breakdown */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Ingresos
            </div>
            <span className="font-bold text-green-600">
              {formatCurrency(income)}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Repeat className="h-4 w-4 text-orange-500" />
              Gastos fijos
            </div>
            <span className="font-bold text-orange-500">
              -{formatCurrency(totalFixed)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Gastos variables
            </div>
            <span className="font-bold text-red-500">
              -{formatCurrency(variableExpenses)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-purple-500" />
              Pagos tarjetas
            </div>
            <span className="font-bold text-purple-500">
              -{formatCurrency(totalCardPayments)}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Wallet className="h-4 w-4" />
              Disponible
            </div>
            <span
              className={`text-lg font-bold ${available < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {formatCurrency(available)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
