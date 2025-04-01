"use client";

import { useTransition } from "react";
import { Button } from "@/app/components/ui/button";

import { createInvoice } from "./functions";

export function CreateInvoiceButton() {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const newInvoice = await createInvoice();
      window.location.href = `/invoice/${newInvoice.id}`;
    });
  };

  return (
    <Button onClick={onClick} disabled={isPending}>
      New Invoice
    </Button>
  );
}
