import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { IncomeEntryForm } from "@/components/income-entry-form";
import { DeleteIncomeButton } from "@/components/delete-income-button";

export const dynamic = "force-dynamic";

export default async function IncomesPage() {
  const incomes = await prisma.income.findMany({
    where: { isActive: true },
    orderBy: { dayOfMonth: "asc" },
  });

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            Mensuales
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Ingresos
          </h1>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1 h-auto font-headline font-bold">
          {formatCurrency(totalIncome)}
        </Badge>
      </div>

      <IncomeEntryForm />

      {incomes.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center editorial-shadow">
          <MaterialIcon name="trending_up" className="text-4xl text-on-surface-variant/30 mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2">No hay ingresos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="bg-surface-container-lowest rounded-2xl p-4 editorial-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-tertiary-fixed/30 flex items-center justify-center">
                  <MaterialIcon name="trending_up" className="text-xl text-tertiary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{income.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    Día {income.dayOfMonth} de cada mes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-base font-bold text-tertiary">
                  {formatCurrency(Number(income.amount))}
                </span>
                <DeleteIncomeButton id={income.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
