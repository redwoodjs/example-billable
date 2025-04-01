"use client";

import { useTransition } from "react";
import { Button } from "@/app/components/ui/button";

import { newInvoice } from "./functions";

export function NewInvoiceButton() {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const invoice = await newInvoice();
      window.location.href = `/invoice/${invoice.id}`;
    });
  };

  return (
    <Button onClick={onClick} disabled={isPending}>
      New Invoice
    </Button>
  );
}
