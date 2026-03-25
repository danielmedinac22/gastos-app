"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  // Filter months
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
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-1.5"
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
          className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-1.5"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm px-1">
        <span className="text-muted-foreground">Total filtrado</span>
        <span className="font-bold text-red-500">{formatCurrency(grandTotal)}</span>
      </div>

      {/* Results */}
      {filteredMonths.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin gastos para los filtros seleccionados
        </p>
      )}

      {filteredMonths.map((em) => (
        <Card key={em.key}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{em.label}</CardTitle>
              <span className="text-sm font-bold text-red-500">
                {formatCurrency(em.total)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {em.categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(cat.total)}
                  </span>
                </div>

                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pl-6 text-xs text-muted-foreground"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{item.description}</span>
                      {item.cardName ? (
                        <span
                          className="px-1 py-0 rounded border text-[10px]"
                          style={{ borderColor: item.cardColor ?? undefined }}
                        >
                          {item.cardName}
                        </span>
                      ) : (
                        <span className="px-1 py-0 rounded border text-[10px] border-emerald-400">
                          Efectivo
                        </span>
                      )}
                    </div>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
