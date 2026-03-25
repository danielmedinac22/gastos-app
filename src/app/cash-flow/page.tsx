import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { buildPaymentPeriods, type PaymentPeriod } from "@/lib/cash-flow";
import { CashFlowTabs } from "@/components/cash-flow-tabs";
import { ExpensesByMonth } from "@/components/expenses-by-month";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const startRange = new Date(currentYear, currentMonth - 12, 1);
  const endRange = new Date(nextYear, nextMonth + 1, 0);

  const [incomes, fixedExpenses, cards, cashExpenses, allExpenses] = await Promise.all([
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
    prisma.expense.findMany({
      where: {
        date: { gte: startRange, lte: endRange },
      },
      include: { category: true, creditCard: true },
      orderBy: { date: "asc" },
    }),
  ]);

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

  // Group ALL expenses by month for "Gastos por mes" tab
  const expensesByMonth = new Map<string, {
    label: string;
    month: number;
    year: number;
    total: number;
    categories: Map<string, { icon: string; name: string; total: number; items: { description: string; amount: number; date: Date; method: string; cardName?: string; cardColor?: string; categoryId: string }[] }>;
  }>();

  for (const exp of allExpenses) {
    const d = new Date(exp.date);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    if (!expensesByMonth.has(key)) {
      const monthName = new Intl.DateTimeFormat("es-CO", { month: "long" }).format(new Date(y, m, 1));
      expensesByMonth.set(key, {
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1) + " " + y,
        month: m,
        year: y,
        total: 0,
        categories: new Map(),
      });
    }
    const group = expensesByMonth.get(key)!;
    group.total += Number(exp.amount);

    const catKey = exp.categoryId;
    if (!group.categories.has(catKey)) {
      group.categories.set(catKey, { icon: exp.category.icon, name: exp.category.name, total: 0, items: [] });
    }
    const cat = group.categories.get(catKey)!;
    cat.total += Number(exp.amount);
    cat.items.push({
      description: exp.description ?? "Sin descripción",
      amount: Number(exp.amount),
      date: d,
      method: exp.paymentMethod,
      cardName: exp.creditCard?.name,
      cardColor: exp.creditCard?.color,
      categoryId: exp.categoryId,
    });
  }
  const expenseMonths = Array.from(expensesByMonth.values()).sort((a, b) => a.year - b.year || a.month - b.month);

  const flowContent = (
    <div className="space-y-4">
      {periods.map((period, i) => {
        const past = isPast(period);

        return (
          <div
            key={i}
            className={`relative bg-surface-container-lowest rounded-2xl p-5 editorial-shadow ${past ? "opacity-50" : ""}`}
          >
            {/* Active indicator */}
            {!past && i === periods.findIndex((p) => !isPast(p)) && (
              <div className="absolute -left-1.5 top-4 bottom-4 w-1 bg-primary rounded-full" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MaterialIcon name="calendar_today" className="text-lg text-primary" />
                <span className="font-headline text-base font-bold">{period.label}</span>
              </div>
              {past && (
                <Badge variant="secondary" className="text-[10px]">
                  Pasado
                </Badge>
              )}
            </div>

            {/* Incomes */}
            {period.incomes.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  <MaterialIcon name="trending_up" className="text-sm text-tertiary" />
                  Ingresos
                </div>
                {period.incomes.map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between pl-5">
                    <span className="text-sm text-on-surface">{inc.name}</span>
                    <span className="text-sm font-medium text-tertiary">
                      +{formatCurrency(inc.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-5 text-xs text-tertiary font-semibold">
                  <span>Subtotal ingresos</span>
                  <span>+{formatCurrency(period.totalIncome)}</span>
                </div>
              </div>
            )}

            {/* Fixed expenses */}
            {period.fixedExpenses.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  <MaterialIcon name="repeat" className="text-sm text-warning" />
                  Gastos fijos
                </div>
                {period.fixedExpenses.map((fe) => (
                  <div key={fe.id} className="flex items-center justify-between pl-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{fe.categoryIcon}</span>
                      <span className="text-sm text-on-surface">{fe.name}</span>
                      {fe.creditCardName && (
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block mr-0.5"
                            style={{ backgroundColor: fe.creditCardColor ?? undefined }}
                          />
                          {fe.creditCardName}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(fe.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-5 text-xs text-warning font-semibold">
                  <span>Subtotal fijos</span>
                  <span>{formatCurrency(period.totalFixed)}</span>
                </div>
              </div>
            )}

            {/* Card payments */}
            {period.cardPayments.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  <MaterialIcon name="credit_card" className="text-sm text-primary" />
                  Pagos tarjetas
                </div>
                {period.cardPayments.map((cp) => (
                  <div key={cp.cardId} className="flex items-center justify-between pl-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cp.cardColor }}
                      />
                      <span className="text-sm text-on-surface">{cp.cardName}</span>
                      {cp.isEstimate && (
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                          Estimado
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(cp.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-5 text-xs text-primary font-semibold">
                  <span>Subtotal tarjetas</span>
                  <span>{formatCurrency(period.totalCards)}</span>
                </div>
              </div>
            )}

            {period.incomes.length === 0 &&
              period.fixedExpenses.length === 0 &&
              period.cardPayments.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-2">
                  Sin movimientos programados
                </p>
              )}

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-surface-container-high space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Ingresos</span>
                <span className="text-tertiary font-medium">
                  +{formatCurrency(period.totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Gastos</span>
                <span className="text-error font-medium">
                  -{formatCurrency(period.totalExpenses)}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 -mx-1 rounded-xl ${period.available >= 0 ? "bg-tertiary-fixed/20" : "bg-error-container/20"}`}>
                <div className="flex items-center gap-1.5 font-headline font-bold text-sm">
                  <MaterialIcon name="account_balance_wallet" className="text-base" />
                  Disponible
                </div>
                <span className={`font-headline font-bold ${period.available < 0 ? "text-error" : "text-tertiary"}`}>
                  {formatCurrency(period.available)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Cash expense summaries by month */}
      {cashMonths.map((cm) => {
        const categories = Array.from(cm.categories.values()).sort((a, b) => b.total - a.total);
        const total = categories.reduce((sum, c) => sum + c.total, 0);

        return (
          <div key={`cash-${cm.year}-${cm.month}`} className="bg-surface-container-lowest rounded-2xl p-5 editorial-shadow">
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon name="payments" className="text-lg text-on-surface-variant" />
              <span className="font-headline text-base font-bold">Efectivo — {cm.label}</span>
            </div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between pl-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-sm text-on-surface">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(cat.total)}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
                <span className="text-sm font-bold">Total efectivo</span>
                <span className="font-headline font-bold text-error">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Serialize expense data for client component
  const serializedMonths = expenseMonths.map((em) => {
    const categories = Array.from(em.categories.values()).sort((a, b) => b.total - a.total);
    return {
      key: `${em.year}-${em.month}`,
      label: em.label,
      month: em.month,
      year: em.year,
      total: em.total,
      categories: categories.map((cat) => ({
        icon: cat.icon,
        name: cat.name,
        total: cat.total,
        items: cat.items.map((item) => ({
          description: item.description,
          amount: item.amount,
          date: item.date.toISOString(),
          method: item.method,
          cardName: item.cardName,
          cardColor: item.cardColor,
          categoryId: item.categoryId,
        })),
      })),
    };
  });

  const categoryMap = new Map<string, { id: string; icon: string; name: string }>();
  for (const exp of allExpenses) {
    if (!categoryMap.has(exp.categoryId)) {
      categoryMap.set(exp.categoryId, { id: exp.categoryId, icon: exp.category.icon, name: exp.category.name });
    }
  }
  const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const currentMonthKey = `${currentYear}-${currentMonth}`;

  const expensesContent = (
    <ExpensesByMonth
      months={serializedMonths}
      categories={uniqueCategories}
      currentMonthKey={currentMonthKey}
    />
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            Proyección
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Flujo de caja
          </h1>
        </div>
        <Link href="/incomes" className="flex items-center gap-1 text-sm font-bold text-primary">
          Gestionar ingresos
          <MaterialIcon name="chevron_right" className="text-base" />
        </Link>
      </div>

      <CashFlowTabs
        flowContent={flowContent}
        expensesContent={expensesContent}
      />
    </div>
  );
}
