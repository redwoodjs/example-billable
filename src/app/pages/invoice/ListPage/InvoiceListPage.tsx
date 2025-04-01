"use server";

import { Layout } from "@/app/pages/Layout";

import { NewInvoiceButton } from "./components/NewInvoiceButton";
import { db } from "@/db";

import { link } from "@/app/shared/links";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { RouteOptions } from "@/worker";

export type InvoiceItem = {
  description: string;
  price: number;
  quantity: number;
};

export type InvoiceTaxes = {
  description: string;
  amount: number;
};

async function getInvoiceListSummary(userId: string) {
  const invoices =
    (await db.invoice.findMany({
      select: {
        id: true,
        number: true,
        date: true,
        status: true,
        customer: true,
      },
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    })) ?? [];

  return invoices.map((invoice) => {
    const { id, date, number, customer, status } = invoice;
    return {
      id,
      date,
      number,
      customer: customer?.split("\n")[0] || "",
      status,
    };
  });
}

export async function InvoiceListPage({ appContext }: RouteOptions) {
  const user = appContext.user!;

  const invoices = await getInvoiceListSummary(user.id);
  return (
    <Layout appContext={appContext}>
      <div className="space-y-2 py-4 text-right">
        <NewInvoiceButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        {invoices.length === 0 && (
          <TableCaption>No invoices found</TableCaption>
        )}
        <TableBody>
          {invoices.map((i) => (
            <InvoiceListItem {...i} key={"invoice-" + i.id} />
          ))}
        </TableBody>
      </Table>
    </Layout>
  );
}

function InvoiceListItem(
  props: Awaited<ReturnType<typeof getInvoiceListSummary>>[number],
) {
  return (
    <TableRow>
      <TableCell>
        <a href={link("/invoice/:id", { id: props.id })}>{props.number}</a>
      </TableCell>
      <TableCell>
        {props.date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </TableCell>
      <TableCell>{props.customer}</TableCell>
      <TableCell className="text-right">
        <a href={link("/invoice/:id", { id: props.id })}>Edit</a>
      </TableCell>
    </TableRow>
  );
}
