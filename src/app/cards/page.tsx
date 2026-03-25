import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";
import { buttonVariants } from "@/components/ui/button-variants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const cards = await prisma.creditCard.findMany({
    where: { isActive: true },
    include: {
      billingCycles: {
        where: { isClosed: false },
        include: { expenses: { select: { amount: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            Crédito
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Tarjetas
          </h1>
        </div>
        <Link href="/cards/new" className={buttonVariants({ variant: "gradient", size: "sm" })}>
          <MaterialIcon name="add" className="text-base mr-0.5" />
          Nueva
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="credit_card" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">No hay tarjetas registradas</p>
          <Link href="/cards/new" className="text-sm text-primary font-semibold underline mt-2 inline-block">
            Agregar tarjeta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            const cycleTotal = card.billingCycles
              .flatMap((c) => c.expenses)
              .reduce((sum, e) => sum + Number(e.amount), 0);
            const limit = card.creditLimit ? Number(card.creditLimit) : null;
            const usage = limit ? (cycleTotal / limit) * 100 : null;

            return (
              <Link key={card.id} href={`/cards/${card.id}`}>
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden editorial-shadow active:scale-[0.98] transition-all duration-200">
                  <div className="h-1.5" style={{ backgroundColor: card.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed/50 flex items-center justify-center">
                          <MaterialIcon name="credit_card" className="text-lg text-primary" />
                        </div>
                        <span className="font-semibold text-on-surface">{card.name}</span>
                      </div>
                      <span className="font-headline text-2xl font-extrabold tracking-tight">
                        {formatCurrency(cycleTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant block">Corte</span>
                          <span className="text-sm font-medium text-on-surface">Día {card.cutOffDay}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant block">Pago</span>
                          <span className="text-sm font-medium text-on-surface">Día {card.paymentDay}</span>
                        </div>
                      </div>
                    </div>
                    {usage !== null && (
                      <div className="mt-3">
                        <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(usage, 100)}%`,
                              backgroundColor: usage > 80 ? "#EF4444" : card.color,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1 text-right font-medium">
                          {usage.toFixed(0)}% del cupo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
