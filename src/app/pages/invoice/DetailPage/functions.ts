"use server";

import { type Invoice } from "@prisma/client";
import { db } from "@/db";
import type {
  InvoiceItem,
  InvoiceLabels,
  InvoiceTaxes,
} from "./InvoiceDetailPage";
import { RouteOptions } from "@/worker";

export async function saveInvoice(
  id: string,
  invoice: Omit<Invoice, "items" | "taxes" | "labels">,
  labels: InvoiceLabels,
  items: InvoiceItem[],
  taxes: InvoiceTaxes[],
  opts?: RouteOptions,
) {
  const { appContext } = opts!;

  await db.invoice.findFirstOrThrow({
    where: {
      id,
      userId: appContext?.user?.id,
    },
  });

  const data: Invoice = {
    ...invoice,
    items: JSON.stringify(items),
    taxes: JSON.stringify(taxes),
    labels: JSON.stringify(labels),
  };

  await db.invoice.upsert({
    create: data,
    update: data,
    where: {
      id,
    },
  });
}

export async function deleteLogo(id: string, opts?: RouteOptions) {
  const { appContext } = opts!;

  await db.invoice.findFirstOrThrow({
    where: {
      id,
      userId: appContext?.user?.id,
    },
  });

  await db.invoice.update({
    data: {
      supplierLogo: null,
    },
    where: {
      id,
    },
  });
}
