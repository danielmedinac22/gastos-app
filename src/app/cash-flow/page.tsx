import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { buildPaymentPeriods, type PaymentPeriod } from "@/lib/cash-flow";
import Link from "next/link";
import { CalendarDays, Repeat, CreditCard, Wallet, TrendingUp, ChevronRight, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const startRange = new Date(currentYear, currentMonth, 1);
  const endRange = new Date(nextYear, nextMonth + 1, 0);

  const [incomes, fixedExpenses, cards, cashExpenses] = await Promise.all([
    prisma.income.findMany({
      where: { isActive: true },
      orderBy: { dayOfMonth: "asc" },
    }),
    prisma.fixedExpense.findMany({
      where: { isActive: true },
      include: { category: true, creditCard: true },
      orderBy: { dayOfMonth: "asc" },
    }),
    prisma.creditCard.findMany({
      where: { isActive: true },
      include: {
        billingCycles: {
          where: {
            isPaid: false,
            paymentDate: { gte: startRange, lte: endRange },
          },
          select: {
            id: true,
            totalAmount: true,
            isPaid: true,
            isClosed: true,
            paymentDate: true,
            expenses: {
              select: { amount: true },
            },
          },
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        paymentMethod: "CASH",
        date: { gte: startRange, lte: endRange },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Compute real totalAmount from expenses (fixes stale/zero totalAmount)
  const cardsWithTotals = cards.map((card) => ({
    ...card,
    billingCycles: card.billingCycles.map((cycle) => {
      const expenseTotal = cycle.expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      );
      return {
        ...cycle,
        totalAmount: expenseTotal > 0 ? expenseTotal : Number(cycle.totalAmount),
      };
    }),
  }));

  const periods = buildPaymentPeriods(now, incomes, fixedExpenses, cardsWithTotals);

  const isPast = (period: PaymentPeriod) => period.date < now;

  // Group cash expenses by month, then by category
  const cashByMonth = new Map<string, { label: string; month: number; year: number; categories: Map<string, { icon: string; name: string; total: number }> }>();
  for (const exp of cashExpenses) {
    const d = new Date(exp.date);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    if (!cashByMonth.has(key)) {
      const monthName = new Intl.DateTimeFormat("es-CO", { month: "long" }).format(new Date(y, m, 1));
      cashByMonth.set(key, { label: monthName.charAt(0).toUpperCase() + monthName.slice(1), month: m, year: y, categories: new Map() });
    }
    const group = cashByMonth.get(key)!;
    const catKey = exp.categoryId;
    if (!group.categories.has(catKey)) {
      group.categories.set(catKey, { icon: exp.category.icon, name: exp.category.name, total: 0 });
    }
    group.categories.get(catKey)!.total += Number(exp.amount);
  }
  const cashMonths = Array.from(cashByMonth.values()).sort((a, b) => a.year - b.year || a.month - b.month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flujo de caja</h1>
        <Link href="/incomes" className="flex items-center gap-1 text-xs text-primary">
          Gestionar ingresos
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {periods.map((period, i) => {
        const past = isPast(period);

        return (
          <Card key={i} className={past ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {period.label}
                </CardTitle>
                {past && (
                  <Badge variant="secondary" className="text-[10px]">
                    Pasado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Incomes */}
              {period.incomes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Ingresos
                  </div>
                  {period.incomes.map((inc) => (
                    <div
                      key={inc.id}
                      className="flex items-center justify-between pl-4"
                    >
                      <span className="text-sm">{inc.name}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatCurrency(inc.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pl-4 text-xs text-green-600 font-medium">
                    <span>Subtotal ingresos</span>
                    <span>+{formatCurrency(period.totalIncome)}</span>
                  </div>
                </div>
              )}

              {/* Fixed expenses */}
              {period.fixedExpenses.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Repeat className="h-3 w-3" />
                    Gastos fijos
                  </div>
                  {period.fixedExpenses.map((fe) => (
                    <div
                      key={fe.id}
                      className="flex items-center justify-between pl-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{fe.categoryIcon}</span>
                        <span className="text-sm">{fe.name}</span>
                        {fe.creditCardName && (
                          <span
                            className="text-[10px] px-1.5 py-0 rounded border"
                            style={{ borderColor: fe.creditCardColor ?? undefined }}
                          >
                            {fe.creditCardName}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(fe.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pl-4 text-xs text-orange-500 font-medium">
                    <span>Subtotal fijos</span>
                    <span>{formatCurrency(period.totalFixed)}</span>
                  </div>
                </div>
              )}

              {/* Card payments */}
              {period.cardPayments.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    Pagos tarjetas
                  </div>
                  {period.cardPayments.map((cp) => (
                    <div
                      key={cp.cardId}
                      className="flex items-center justify-between pl-4"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cp.cardColor }}
                        />
                        <span className="text-sm">{cp.cardName}</span>
                        {cp.isEstimate && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Estimado
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(cp.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pl-4 text-xs text-purple-500 font-medium">
                    <span>Subtotal tarjetas</span>
                    <span>{formatCurrency(period.totalCards)}</span>
                  </div>
                </div>
              )}

              {period.incomes.length === 0 &&
                period.fixedExpenses.length === 0 &&
                period.cardPayments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Sin movimientos programados
                  </p>
                )}

              <Separator />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ingresos</span>
                  <span className="text-green-600 font-medium">
                    +{formatCurrency(period.totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="text-red-500 font-medium">
                    -{formatCurrency(period.totalExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    Disponible
                  </div>
                  <span
                    className={`font-bold ${period.available < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {formatCurrency(period.available)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Cash expense summaries by month */}
      {cashMonths.map((cm) => {
        const categories = Array.from(cm.categories.values()).sort((a, b) => b.total - a.total);
        const total = categories.reduce((sum, c) => sum + c.total, 0);

        return (
          <Card key={`cash-${cm.year}-${cm.month}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Efectivo — {cm.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between pl-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Total efectivo</span>
                <span className="text-sm font-bold text-red-500">
                  {formatCurrency(total)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
