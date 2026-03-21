import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CreditCard, TrendingDown, Wallet, CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [settings, monthExpenses, cards, upcomingCycles] = await Promise.all([
    prisma.settings.findFirst({ where: { id: "default" } }),
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
  ]);

  const totalMonth = Number(monthExpenses._sum.amount ?? 0);
  const income = Number(settings?.monthlyIncome ?? 0);
  const available = income - totalMonth;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Gastos del mes
            </div>
            <p className="text-lg font-bold">{formatCurrency(totalMonth)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Wallet className="h-3.5 w-3.5" />
              Disponible
            </div>
            <p className={`text-lg font-bold ${available < 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(available)}
            </p>
          </CardContent>
        </Card>
      </div>

      {cards.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Tarjetas - Ciclo actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cards.map((card) => {
              const cycleTotal = card.billingCycles
                .flatMap((c) => c.expenses)
                .reduce((sum, e) => sum + Number(e.amount), 0);
              return (
                <Link key={card.id} href={`/cards/${card.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: card.color }}
                      />
                      <span className="text-sm font-medium">{card.name}</span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(cycleTotal)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {upcomingCycles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Próximos pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingCycles.map((cycle) => {
              const daysUntil = Math.ceil(
                (cycle.paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={cycle.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cycle.creditCard.color }}
                    />
                    <span className="text-sm">{cycle.creditCard.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {formatCurrency(Number(cycle.totalAmount))}
                    </span>
                    <Badge variant={daysUntil <= 1 ? "destructive" : "secondary"}>
                      {daysUntil <= 0 ? "Hoy" : `${daysUntil}d`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {cards.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Agrega tu primera tarjeta para comenzar</p>
            <Link
              href="/cards/new"
              className="text-sm text-primary underline mt-1 inline-block"
            >
              Agregar tarjeta
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
