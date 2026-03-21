"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createIncome(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dayOfMonth = parseInt(formData.get("dayOfMonth") as string);

  await prisma.income.create({
    data: { name, amount, dayOfMonth },
  });

  revalidatePath("/incomes");
  revalidatePath("/cash-flow");
  revalidatePath("/");
}

export async function deleteIncome(id: string) {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/incomes");
  revalidatePath("/cash-flow");
  revalidatePath("/");
}
