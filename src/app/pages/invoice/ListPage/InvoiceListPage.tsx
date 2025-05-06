import { Layout } from "@/app/pages/Layout";
import { requestInfo } from "rwsdk/worker";

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
  return await db.invoice.findMany({
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
  });
}

export async function InvoiceListPage() {
  const user = requestInfo.ctx.user!;
  const invoices = await getInvoiceListSummary(user.id);

  console.log(invoices);

  return (
    <Layout>
      <div className="space-y-2 py-4 text-right">
        <NewInvoiceButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        {!invoices.length && <TableCaption>No invoices found</TableCaption>}
        <TableBody>
          {invoices &&
            invoices.map((i) => (
              <InvoiceListItem key={"invoice-" + i.id} {...i} />
            ))}
        </TableBody>
      </Table>
    </Layout>
  );
}

function InvoiceListItem(
  props: Awaited<ReturnType<typeof getInvoiceListSummary>>[0]
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
      <TableCell>{props.customer ?? ""}</TableCell>
      <TableCell className="text-right">
        <a href={link("/invoice/:id", { id: props.id })}>Edit</a>
      </TableCell>
    </TableRow>
  );
}
