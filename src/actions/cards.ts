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
