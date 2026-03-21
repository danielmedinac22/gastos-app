type FixedExpenseItem = {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  categoryIcon: string;
  creditCardName: string | null;
  creditCardColor: string | null;
};

type CardPaymentItem = {
  cardId: string;
  cardName: string;
  cardColor: string;
  paymentDay: number;
  amount: number;
  cycleId: string | null;
  isEstimate: boolean;
};

export type PaymentPeriod = {
  label: string;
  date: Date;
  day: 15 | 30;
  month: number;
  year: number;
  fixedExpenses: FixedExpenseItem[];
  cardPayments: CardPaymentItem[];
  totalFixed: number;
  totalCards: number;
  total: number;
};

function assignToDay(dayOfMonth: number): 15 | 30 {
  return dayOfMonth <= 15 ? 15 : 30;
}

export function buildPaymentPeriods(
  currentDate: Date,
  fixedExpenses: {
    id: string;
    name: string;
    amount: { toString(): string };
    dayOfMonth: number;
    category: { icon: string };
    creditCard: { name: string; color: string } | null;
  }[],
  cards: {
    id: string;
    name: string;
    color: string;
    paymentDay: number;
    billingCycles: {
      id: string;
      totalAmount: { toString(): string };
      isPaid: boolean;
      isClosed: boolean;
      paymentDate: Date;
    }[];
  }[]
): PaymentPeriod[] {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const periods: PaymentPeriod[] = ([
    { day: 15 as const, month: currentMonth, year: currentYear },
    { day: 30 as const, month: currentMonth, year: currentYear },
    { day: 15 as const, month: nextMonth, year: nextYear },
    { day: 30 as const, month: nextMonth, year: nextYear },
  ]).map(({ day, month, year }) => {
    const monthName = new Intl.DateTimeFormat("es-CO", { month: "short" }).format(
      new Date(year, month, 1)
    );

    return {
      label: `${day} de ${monthName}`,
      date: new Date(year, month, day),
      day,
      month,
      year,
      fixedExpenses: [],
      cardPayments: [],
      totalFixed: 0,
      totalCards: 0,
      total: 0,
    };
  });

  // Assign fixed expenses to each period (they repeat every month)
  for (const fe of fixedExpenses) {
    const targetDay = assignToDay(fe.dayOfMonth);
    const item: FixedExpenseItem = {
      id: fe.id,
      name: fe.name,
      amount: parseFloat(fe.amount.toString()),
      dayOfMonth: fe.dayOfMonth,
      categoryIcon: fe.category.icon,
      creditCardName: fe.creditCard?.name ?? null,
      creditCardColor: fe.creditCard?.color ?? null,
    };

    for (const period of periods) {
      if (period.day === targetDay) {
        period.fixedExpenses.push(item);
      }
    }
  }

  // Assign card payments to periods based on paymentDay
  for (const card of cards) {
    const targetDay = assignToDay(card.paymentDay);

    for (const period of periods) {
      if (period.day !== targetDay) continue;

      // Find the billing cycle that matches this period
      const matchingCycle = card.billingCycles.find((cycle) => {
        const pd = cycle.paymentDate;
        return pd.getMonth() === period.month && pd.getFullYear() === period.year;
      });

      // If no matching cycle, look for an open (not closed) cycle as estimate
      const openCycle = !matchingCycle
        ? card.billingCycles.find((c) => !c.isClosed && !c.isPaid)
        : null;

      const cycle = matchingCycle ?? openCycle;
      if (!cycle || cycle.isPaid) continue;

      const amount = parseFloat(cycle.totalAmount.toString());
      if (amount <= 0) continue;

      period.cardPayments.push({
        cardId: card.id,
        cardName: card.name,
        cardColor: card.color,
        paymentDay: card.paymentDay,
        amount,
        cycleId: cycle.id,
        isEstimate: !matchingCycle && !!openCycle,
      });
    }
  }

  // Calculate totals
  for (const period of periods) {
    period.totalFixed = period.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    period.totalCards = period.cardPayments.reduce((sum, p) => sum + p.amount, 0);
    period.total = period.totalFixed + period.totalCards;
  }

  return periods;
}
