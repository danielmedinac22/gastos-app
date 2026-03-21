"use client";

import { markCyclePaid } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function MarkPaidButton({ cycleId }: { cycleId: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => markCyclePaid(cycleId)}
      className="text-xs"
    >
      <Check className="h-3 w-3 mr-1" />
      Marcar pagado
    </Button>
  );
}
