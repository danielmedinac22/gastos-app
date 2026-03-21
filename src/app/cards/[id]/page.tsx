import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { MarkPaidButton } from "@/components/mark-paid-button";

export const dynamic = "force-dynamic";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const card = await prisma.creditCard.findUnique({
    where: { id },
    include: {
      billingCycles: {
        orderBy: { startDate: "desc" },
        take: 3,
        include: {
          expenses: {
            include: { category: true },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  });

  if (!card) notFound();

  return (
    <div className="space-y-4">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: card.color }}
        />
        <h1 className="text-2xl font-bold">{card.name}</h1>
      </div>

      <div className="flex gap-3 text-sm text-muted-foreground">
        <span>Corte: día {card.cutOffDay}</span>
        <span>Pago: día {card.paymentDay}</span>
        {card.creditLimit && (
          <span>Cupo: {formatCurrency(Number(card.creditLimit))}</span>
        )}
      </div>

      {/* Cycles */}
      {card.billingCycles.map((cycle) => {
        const total = cycle.expenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0
        );

        return (
          <Card key={cycle.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {cycle.isPaid ? (
                    <Badge className="bg-green-100 text-green-700">Pagado</Badge>
                  ) : cycle.isClosed ? (
                    <Badge variant="destructive">Por pagar</Badge>
                  ) : (
                    <Badge variant="secondary">Activo</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{formatCurrency(total)}</span>
                {!cycle.isPaid && cycle.isClosed && (
                  <MarkPaidButton cycleId={cycle.id} />
                )}
              </div>
              {!cycle.isPaid && (
                <p className="text-xs text-muted-foreground">
                  Pago: {formatDate(cycle.paymentDate)}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {cycle.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{expense.category.icon}</span>
                    <span>{expense.description || expense.category.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                </div>
              ))}
              {cycle.expenses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Sin gastos en este ciclo
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {card.billingCycles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">
              No hay ciclos aún. Se crearán automáticamente al registrar gastos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
