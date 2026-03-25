import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [incomes, monthExpenses, cards, upcomingCycles, fixedExpenses] = await Promise.all([
    prisma.income.findMany({ where: { isActive: true } }),
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.creditCard.findMany({
      where: { isActive: true },
      include: {
        billingCycles: {
          where: { isClosed: false },
          include: { expenses: { select: { amount: true } } },
        },
      },
    }),
    prisma.billingCycle.findMany({
      where: {
        isPaid: false,
        paymentDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: { creditCard: true },
      orderBy: { paymentDate: "asc" },
    }),
    prisma.fixedExpense.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { dayOfMonth: "asc" },
    }),
  ]);

  const totalMonth = Number(monthExpenses._sum.amount ?? 0);
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const available = totalIncome - totalMonth;

  return (
    <div className="space-y-5">
      {/* Section label */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
          Resumen
        </p>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Inicio
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-2">
            <MaterialIcon name="trending_down" className="text-lg text-error" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Gastos del mes</span>
          </div>
          <p className="font-headline text-xl font-bold tracking-tight">{formatCurrency(totalMonth)}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-tertiary">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-2">
            <MaterialIcon name="account_balance_wallet" className="text-lg text-tertiary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Disponible</span>
          </div>
          <p className={`font-headline text-xl font-bold tracking-tight ${available < 0 ? "text-error" : "text-tertiary"}`}>
            {formatCurrency(available)}
          </p>
        </div>
      </div>

      {/* Income link */}
      <Link href="/incomes" className="block">
        <div className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow flex items-center justify-between active:scale-[0.98] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-tertiary-fixed/30 flex items-center justify-center">
              <MaterialIcon name="trending_up" className="text-xl text-tertiary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Ingresos</p>
              <p className="text-xs text-on-surface-variant">
                {incomes.length} fuente{incomes.length !== 1 ? "s" : ""} · {formatCurrency(totalIncome)}/mes
              </p>
            </div>
          </div>
          <MaterialIcon name="chevron_right" className="text-xl text-on-surface-variant" />
        </div>
      </Link>

      {/* Fixed expenses link */}
      <Link href="/fixed" className="block">
        <div className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow flex items-center justify-between active:scale-[0.98] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-warning-light flex items-center justify-center">
              <MaterialIcon name="repeat" className="text-xl text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Gastos fijos</p>
              <p className="text-xs text-on-surface-variant">
                {fixedExpenses.length} gasto{fixedExpenses.length !== 1 ? "s" : ""} · {formatCurrency(totalFixed)}/mes
              </p>
            </div>
          </div>
          <MaterialIcon name="chevron_right" className="text-xl text-on-surface-variant" />
        </div>
      </Link>

      {/* Card summary */}
      {cards.length > 0 && (
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon name="credit_card" className="text-lg text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Tarjetas — Ciclo actual
            </span>
          </div>
          <div className="space-y-3">
            {cards.map((card) => {
              const cycleTotal = card.billingCycles
                .flatMap((c) => c.expenses)
                .reduce((sum, e) => sum + Number(e.amount), 0);
              return (
                <Link key={card.id} href={`/cards/${card.id}`} className="block">
                  <div className="flex items-center justify-between active:scale-[0.98] transition-all duration-200">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: card.color }}
                      />
                      <span className="text-sm font-medium text-on-surface">{card.name}</span>
                    </div>
                    <span className="font-headline text-sm font-bold tracking-tight">
                      {formatCurrency(cycleTotal)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming payments */}
      {upcomingCycles.length > 0 && (
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon name="event_upcoming" className="text-lg text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Próximos pagos
            </span>
          </div>
          <div className="space-y-3">
            {upcomingCycles.map((cycle) => {
              const daysUntil = Math.ceil(
                (cycle.paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={cycle.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cycle.creditCard.color }}
                    />
                    <span className="text-sm text-on-surface">{cycle.creditCard.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-sm font-bold tracking-tight">
                      {formatCurrency(Number(cycle.totalAmount))}
                    </span>
                    <Badge variant={daysUntil <= 1 ? "destructive" : "secondary"}>
                      {daysUntil <= 0 ? "Hoy" : `${daysUntil}d`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="credit_card" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">Agrega tu primera tarjeta para comenzar</p>
          <Link
            href="/cards/new"
            className="text-sm text-primary font-semibold underline mt-2 inline-block"
          >
            Agregar tarjeta
          </Link>
        </div>
      )}
    </div>
  );
}
