import { RouteOptions } from "@/worker";

import { Layout } from "./Layout";
import { InvoiceForm } from "./invoice/DetailPage/InvoiceForm";

export function HomePage({ appContext }: RouteOptions) {
  return (
    <Layout appContext={appContext}>
      <InvoiceForm
        invoice={{
          items: [
            {
              description: "",
              quantity: 1,
              price: 1,
            },
          ],
          taxes: [],
          labels: {},
          date: new Date(),
          invoiceNumber: "1",
        }}
        appContext={appContext}
      />
    </Layout>
  );
}
