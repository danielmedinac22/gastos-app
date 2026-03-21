import { prisma } from "./prisma";

/**
 * Given a card and an expense date, find or create the correct billing cycle.
 *
 * Logic:
 * - If expense day <= cutOffDay → cycle ends THIS month
 * - If expense day > cutOffDay → cycle ends NEXT month
 */
export async function getOrCreateCurrentCycle(
  creditCardId: string,
  expenseDate: Date
) {
  const card = await prisma.creditCard.findUniqueOrThrow({
    where: { id: creditCardId },
  });

  const expDay = expenseDate.getDate();
  const expMonth = expenseDate.getMonth(); // 0-indexed
  const expYear = expenseDate.getFullYear();

  let cycleEndMonth: number;
  let cycleEndYear: number;

  if (expDay <= card.cutOffDay) {
    cycleEndMonth = expMonth;
    cycleEndYear = expYear;
  } else {
    cycleEndMonth = expMonth + 1;
    cycleEndYear = expYear;
    if (cycleEndMonth > 11) {
      cycleEndMonth = 0;
      cycleEndYear += 1;
    }
  }

  // End date = cutOffDay of cycleEnd month
  const endDate = new Date(cycleEndYear, cycleEndMonth, card.cutOffDay);

  // Start date = cutOffDay of PREVIOUS month + 1 day
  let startMonth = cycleEndMonth - 1;
  let startYear = cycleEndYear;
  if (startMonth < 0) {
    startMonth = 11;
    startYear -= 1;
  }
  const startDate = new Date(startYear, startMonth, card.cutOffDay + 1);

  // Payment date
  let payMonth = cycleEndMonth;
  let payYear = cycleEndYear;
  if (card.paymentDay <= card.cutOffDay) {
    // Payment is in the month AFTER cut-off
    payMonth = cycleEndMonth + 1;
    if (payMonth > 11) {
      payMonth = 0;
      payYear += 1;
    }
  }
  const paymentDate = new Date(payYear, payMonth, card.paymentDay);

  // Upsert the cycle
  const cycle = await prisma.billingCycle.upsert({
    where: {
      creditCardId_startDate: {
        creditCardId,
        startDate,
      },
    },
    update: {},
    create: {
      creditCardId,
      startDate,
      endDate,
      paymentDate,
      totalAmount: 0,
      isPaid: false,
      isClosed: false,
    },
  });

  return cycle;
}
