import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { notFound } from "next/navigation";
import { MarkPaidButton } from "@/components/mark-paid-button";
import { CardEditForm } from "@/components/card-edit-form";

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
    <div className="space-y-5">
      {/* Card header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: card.color }}
          />
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {card.name}
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant block">Corte</span>
              <span className="text-sm font-medium">Día {card.cutOffDay}</span>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant block">Pago</span>
              <span className="text-sm font-medium">Día {card.paymentDay}</span>
            </div>
            {card.creditLimit && (
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant block">Cupo</span>
                <span className="text-sm font-medium">{formatCurrency(Number(card.creditLimit))}</span>
              </div>
            )}
          </div>
          <CardEditForm
            card={{
              id: card.id,
              name: card.name,
              cutOffDay: card.cutOffDay,
              paymentDay: card.paymentDay,
              color: card.color,
              creditLimit: card.creditLimit ? Number(card.creditLimit) : null,
            }}
          />
        </div>
      </div>

      {/* Cycles */}
      {card.billingCycles.map((cycle) => {
        const total = cycle.expenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0
        );

        return (
          <div key={cycle.id} className="bg-surface-container-lowest rounded-2xl p-5 editorial-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-headline text-sm font-bold">
                {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
              </span>
              {cycle.isPaid ? (
                <Badge variant="success">Pagado</Badge>
              ) : cycle.isClosed ? (
                <Badge variant="destructive">Por pagar</Badge>
              ) : (
                <Badge variant="secondary">Activo</Badge>
              )}
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline text-2xl font-extrabold tracking-tight">
                {formatCurrency(total)}
              </span>
              {!cycle.isPaid && cycle.isClosed && (
                <MarkPaidButton cycleId={cycle.id} />
              )}
            </div>
            {!cycle.isPaid && (
              <p className="text-xs text-on-surface-variant mb-3">
                Pago: {formatDate(cycle.paymentDate)}
              </p>
            )}
            <div className="space-y-2">
              {cycle.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-sm">
                      {expense.category.icon}
                    </div>
                    <span className="text-sm text-on-surface">
                      {expense.description || expense.category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-on-surface-variant">{formatDate(expense.date)}</span>
                    <span className="font-headline font-bold text-sm text-on-surface">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                </div>
              ))}
              {cycle.expenses.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-2">
                  Sin gastos en este ciclo
                </p>
              )}
            </div>
          </div>
        );
      })}

      {card.billingCycles.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="credit_card" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">
            No hay ciclos aún. Se crearán automáticamente al registrar gastos.
          </p>
        </div>
      )}
    </div>
  );
}
