import stylesUrl from "./style.css?url";

import type { DocumentProps } from "@redwoodjs/sdk/router";

export const Document: React.FC<DocumentProps> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Billable: Billing Made Simple. Period.</title>
      <link rel="stylesheet" href={stylesUrl} />
      <link rel="preload" href="/src/client.tsx" as="script" />
    </head>
    <body>
      <div id="root">{children}</div>
      {/* <script src="/src/client.tsx"></script> */}
    </body>
  </html>
);
