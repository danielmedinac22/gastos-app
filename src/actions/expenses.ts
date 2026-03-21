"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentCycle } from "@/lib/cycles";
import { PaymentMethod } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const description = (formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const categoryId = formData.get("categoryId") as string;
  const creditCardId = (formData.get("creditCardId") as string) || null;

  let billingCycleId: string | null = null;

  if (paymentMethod === "CARD" && creditCardId) {
    const cycle = await getOrCreateCurrentCycle(creditCardId, date);
    billingCycleId = cycle.id;
  }

  await prisma.expense.create({
    data: {
      amount,
      description,
      date,
      paymentMethod,
      categoryId,
      creditCardId,
      billingCycleId,
    },
  });

  if (billingCycleId) {
    await syncCycleTotalAmount(billingCycleId);
  }

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/cash-flow");
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    select: { billingCycleId: true },
  });

  await prisma.expense.delete({ where: { id } });

  if (expense?.billingCycleId) {
    await syncCycleTotalAmount(expense.billingCycleId);
  }

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/cash-flow");
}

async function syncCycleTotalAmount(billingCycleId: string) {
  const result = await prisma.expense.aggregate({
    where: { billingCycleId },
    _sum: { amount: true },
  });

  await prisma.billingCycle.update({
    where: { id: billingCycleId },
    data: { totalAmount: result._sum.amount ?? 0 },
  });
}
