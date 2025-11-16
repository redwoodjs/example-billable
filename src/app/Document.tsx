import stylesUrl from "./style.css?url";

import type { DocumentProps } from "rwsdk/router";

export const Document: React.FC<DocumentProps> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Billable: Billing Made Simple. Period.</title>
      <link rel="stylesheet" href={stylesUrl} />
      <link rel="modulepreload" href="/src/client.tsx" as="script" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const stored = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = stored || (prefersDark ? 'dark' : 'light');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            })();
          `,
        }}
      />
    </head>
    <body>
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
