"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function createFixedExpense(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dayOfMonth = parseInt(formData.get("dayOfMonth") as string);
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const categoryId = formData.get("categoryId") as string;
  const creditCardId = (formData.get("creditCardId") as string) || null;

  await prisma.fixedExpense.create({
    data: { name, amount, dayOfMonth, paymentMethod, categoryId, creditCardId },
  });

  revalidatePath("/fixed");
  revalidatePath("/");
}

export async function deleteFixedExpense(id: string) {
  await prisma.fixedExpense.delete({ where: { id } });
  revalidatePath("/fixed");
  revalidatePath("/");
}
