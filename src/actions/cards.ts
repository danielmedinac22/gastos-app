"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCard(formData: FormData) {
  const name = formData.get("name") as string;
  const cutOffDay = parseInt(formData.get("cutOffDay") as string);
  const paymentDay = parseInt(formData.get("paymentDay") as string);
  const color = formData.get("color") as string;
  const creditLimit = formData.get("creditLimit")
    ? parseFloat(formData.get("creditLimit") as string)
    : null;

  await prisma.creditCard.create({
    data: { name, cutOffDay, paymentDay, color, creditLimit },
  });

  revalidatePath("/");
  revalidatePath("/cards");
}

export async function updateCard(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const cutOffDay = parseInt(formData.get("cutOffDay") as string);
  const paymentDay = parseInt(formData.get("paymentDay") as string);
  const color = formData.get("color") as string;
  const creditLimit = formData.get("creditLimit")
    ? parseFloat(formData.get("creditLimit") as string)
    : null;

  await prisma.creditCard.update({
    where: { id },
    data: { name, cutOffDay, paymentDay, color, creditLimit },
  });

  // Recalculate payment dates on unpaid billing cycles
  const card = await prisma.creditCard.findUniqueOrThrow({ where: { id } });
  const cycles = await prisma.billingCycle.findMany({
    where: { creditCardId: id, isPaid: false },
  });

  for (const cycle of cycles) {
    const endMonth = cycle.endDate.getMonth();
    const endYear = cycle.endDate.getFullYear();
    let payMonth = endMonth;
    let payYear = endYear;
    if (card.paymentDay <= card.cutOffDay) {
      payMonth = endMonth + 1;
      if (payMonth > 11) {
        payMonth = 0;
        payYear += 1;
      }
    }
    const newPaymentDate = new Date(payYear, payMonth, card.paymentDay);
    await prisma.billingCycle.update({
      where: { id: cycle.id },
      data: { paymentDate: newPaymentDate },
    });
  }

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/cash-flow");
}

export async function deleteCard(id: string) {
  await prisma.creditCard.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/");
  revalidatePath("/cards");
}

export async function markCyclePaid(cycleId: string) {
  await prisma.billingCycle.update({
    where: { id: cycleId },
    data: { isPaid: true },
  });
  revalidatePath("/");
  revalidatePath("/cards");
}
