"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type ExpenseItem = {
  description: string;
  amount: number;
  date: string;
  method: string;
  cardName?: string;
  cardColor?: string;
  categoryId: string;
};

type CategoryData = {
  icon: string;
  name: string;
  total: number;
  items: ExpenseItem[];
};

type MonthData = {
  key: string;
  label: string;
  month: number;
  year: number;
  total: number;
  categories: CategoryData[];
};

type CategoryOption = {
  id: string;
  icon: string;
  name: string;
};

type Props = {
  months: MonthData[];
  categories: CategoryOption[];
  currentMonthKey: string;
};

export function ExpensesByMonth({ months, categories, currentMonthKey }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMonths = months
    .filter((m) => selectedMonth === "all" || m.key === selectedMonth)
    .map((m) => {
      if (selectedCategory === "all") return m;

      const filteredCats = m.categories.filter(
        (c) => c.items.some((item) => item.categoryId === selectedCategory)
      ).map((c) => {
        const filteredItems = c.items.filter(
          (item) => item.categoryId === selectedCategory
        );
        const total = filteredItems.reduce((sum, item) => sum + item.amount, 0);
        return { ...c, items: filteredItems, total };
      });

      const total = filteredCats.reduce((sum, c) => sum + c.total, 0);
      return { ...m, categories: filteredCats, total };
    })
    .filter((m) => m.categories.length > 0);

  const grandTotal = filteredMonths.reduce((sum, m) => sum + m.total, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="flex-1 text-sm rounded-xl border-none bg-surface-container-low px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todos los meses</option>
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 text-sm rounded-xl border-none bg-surface-container-low px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Total filtrado</span>
        <span className="font-headline font-bold text-error">{formatCurrency(grandTotal)}</span>
      </div>

      {/* Results */}
      {filteredMonths.length === 0 && (
        <p className="text-sm text-on-surface-variant text-center py-8">
          Sin gastos para los filtros seleccionados
        </p>
      )}

      {filteredMonths.map((em) => (
        <div key={em.key} className="bg-surface-container-lowest rounded-2xl p-5 editorial-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="font-headline text-base font-bold text-on-surface">{em.label}</span>
            <span className="font-headline font-bold text-error">
              {formatCurrency(em.total)}
            </span>
          </div>
          <div className="space-y-4">
            {em.categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-semibold text-on-surface">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(cat.total)}
                  </span>
                </div>

                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pl-7 text-xs text-on-surface-variant"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{item.description}</span>
                      {item.cardName ? (
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block mr-0.5"
                            style={{ backgroundColor: item.cardColor ?? undefined }}
                          />
                          {item.cardName}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                          Efectivo
                        </Badge>
                      )}
                    </div>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
