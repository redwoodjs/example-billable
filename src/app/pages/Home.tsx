import { RouteOptions } from "@/worker";

import { Layout } from "./Layout";
import { InvoiceForm } from "./invoice/DetailPage/InvoiceForm";

export function HomePage({ appContext }: RouteOptions) {
  return (
    <Layout appContext={appContext}>
      <InvoiceForm
        invoice={{
          id: "new",
          title: "INVOICE",
          number: "1",
          items: [
            {
              description: "",
              quantity: 1,
              price: 1,
            },
          ],
          taxes: [],
          labels: {
            invoiceNumber: "",
            invoiceDate: "",
            itemDescription: "",
            itemQuantity: "",
            itemPrice: "",
            total: "",
            subtotal: "",
          },
          date: new Date(),
          status: "draft",
          userId: appContext.user?.id ?? "",
          supplierName: "",
          supplierContact: "",
          supplierLogo: null,
          customer: "",
          currency: "$",
          notesA: "",
          notesB: "",
          createdAt: new Date(),
          updatedAt: null,
        }}
        appContext={appContext}
      />
    </Layout>
  );
}
