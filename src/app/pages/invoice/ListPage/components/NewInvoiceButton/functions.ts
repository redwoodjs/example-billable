"use server";

import { db } from "@/db";
import { RouteOptions } from "@/worker";

export async function newInvoice(opts?: RouteOptions) {
  const userId = opts?.appContext?.user?.id!;

  // todo(peterp, 28-01-2025): Implement templates.
  let lastInvoice = await db.invoice.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const newInvoice = await db.invoice.create({
    data: {
      number: (Number(lastInvoice?.number || 0) + 1).toString(),
      supplierName: lastInvoice?.supplierName,
      supplierLogo: lastInvoice?.supplierLogo,
      supplierContact: lastInvoice?.supplierContact,
      notesA: lastInvoice?.notesA,
      notesB: lastInvoice?.notesB,
      taxes: lastInvoice?.taxes,
      userId,
    },
  });

  return newInvoice;
}
