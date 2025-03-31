import { defineApp } from "@redwoodjs/sdk/worker";
import {
  index,
  render,
  prefix,
  type RouteOptions as RWSDKRouteOptions,
} from "@redwoodjs/sdk/router";

import { db, setupDb } from "@/db";
import { sessions, setupSessionStore } from "@/sessionStore";
export { SessionDO } from "@/session";

import { link } from "@/app/shared/links";
import { Document } from "@/app/Document";
import { HomePage } from "@/app/pages/Home";

// import { authRoutes } from "src/pages/auth/routes";
// import { invoiceRoutes } from "src/pages/invoice/routes";

export type AppContext = {
  user: Awaited<ReturnType<typeof getUser>>;
};
export type RouteOptions = RWSDKRouteOptions<AppContext>;

export const getUser = async (request: Request) => {
  try {
    const session = await sessions.load(request);

    const user = await db.user.findFirstOrThrow({
      select: {
        id: true,
        email: true,
      },
      where: { id: session?.userId },
    });
    return user;
  } catch (e) {
    return null;
  }
};

const app = defineApp<AppContext>([
  async ({ request, appContext, env }) => {
    await setupDb(env);
    setupSessionStore(env);
    appContext.user = await getUser(request);
  },
  render(Document, [
    index([
      ({ appContext }) => {
        if (appContext.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: link("/invoice/list") },
          });
        }
      },
      HomePage,
    ]),
    // prefix("/user", authRoutes),
    // prefix("/invoice", invoiceRoutes),
  ]),
]);

export default app;
