import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import Link from "next/link";
import { Plus } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarjetas</h1>
        <Link href="/cards/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva
        </Link>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No hay tarjetas registradas</p>
            <Link href="/cards/new" className="text-sm text-primary underline mt-1 inline-block">
              Agregar tarjeta
            </Link>
          </CardContent>
        </Card>
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
                <Card className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: card.color }} />
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{card.name}</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(cycleTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Corte: día {card.cutOffDay}</span>
                      <span>Pago: día {card.paymentDay}</span>
                    </div>
                    {usage !== null && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(usage, 100)}%`,
                              backgroundColor: usage > 80 ? "#EF4444" : card.color,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 text-right">
                          {usage.toFixed(0)}% del cupo
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
