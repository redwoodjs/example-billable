import { defineApp, ErrorResponse } from "@redwoodjs/sdk/worker";
import {
  index,
  render,
  prefix,
  type RouteOptions as RWSDKRouteOptions,
} from "@redwoodjs/sdk/router";

import { db, setupDb } from "@/db";

import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
export { SessionDurableObject } from "./session/durableObject";

import { link } from "@/app/shared/links";
import { Document } from "@/app/Document";
import { HomePage } from "@/app/pages/Home";

import { userRoutes } from "@/app/pages/user/routes";

// import { authRoutes } from "src/pages/auth/routes";
// import { invoiceRoutes } from "src/pages/invoice/routes";

export type AppContext = {
  user?: Awaited<ReturnType<typeof getUser>>;
  session: Session | null;
};
export type RouteOptions = RWSDKRouteOptions<AppContext>;

export const getUser = async (session: Session | null) => {
  if (!session?.userId) {
    return null;
  }

  return await db.user.findFirstOrThrow({
    select: {
      id: true,
      email: true,
    },
    where: { id: session?.userId },
  });
};

const app = defineApp<AppContext>([
  async ({ request, appContext, env, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      appContext.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");
        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }
    appContext.user = await getUser(appContext.session);
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
    prefix("/user", userRoutes),
    // prefix("/invoice", invoiceRoutes),
  ]),
]);

export default app;
