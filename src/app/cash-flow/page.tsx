import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { IncomeForm } from "@/components/income-form";
import { buildPaymentPeriods, type PaymentPeriod } from "@/lib/cash-flow";
import { CalendarDays, Repeat, CreditCard, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const startRange = new Date(currentYear, currentMonth, 1);
  const endRange = new Date(nextYear, nextMonth + 1, 0);

  const [settings, fixedExpenses, cards] = await Promise.all([
    prisma.settings.findFirst({ where: { id: "default" } }),
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
          },
        },
      },
    }),
  ]);

  const income = Number(settings?.monthlyIncome ?? 0);
  const incomePerPeriod = income / 2;

  const periods = buildPaymentPeriods(now, fixedExpenses, cards);

  const isPast = (period: PaymentPeriod) => period.date < now;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Flujo de caja</h1>

      <IncomeForm currentIncome={income} />

      {periods.map((period, i) => {
        const available = incomePerPeriod - period.total;
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

              {period.fixedExpenses.length === 0 &&
                period.cardPayments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Sin pagos programados
                  </p>
                )}

              <Separator />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ingreso quincenal</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(incomePerPeriod)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total a pagar</span>
                  <span className="text-red-500 font-medium">
                    -{formatCurrency(period.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    Disponible
                  </div>
                  <span
                    className={`font-bold ${available < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {formatCurrency(available)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
