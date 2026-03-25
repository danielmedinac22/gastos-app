"use client";

import { markCyclePaid } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export function MarkPaidButton({ cycleId }: { cycleId: string }) {
  return (
    <Button
      size="sm"
      variant="gradient"
      onClick={() => markCyclePaid(cycleId)}
      className="text-xs"
    >
      <MaterialIcon name="check" className="text-sm mr-0.5" />
      Marcar pagado
    </Button>
  );
}
