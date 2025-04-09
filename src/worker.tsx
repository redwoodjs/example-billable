import {
  defineApp,
  ErrorResponse,
  type RequestInfo,
} from "@redwoodjs/sdk/worker";
import { index, render, prefix } from "@redwoodjs/sdk/router";
import { env } from "cloudflare:workers";
import { Prisma } from "@prisma/client";

import { db, setupDb } from "@/db";

import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
export { SessionDurableObject } from "./session/durableObject";

import { link } from "@/app/shared/links";
import { Document } from "@/app/Document";
import { HomePage } from "@/app/pages/Home";

import { userRoutes } from "@/app/pages/user/routes";
import { invoiceRoutes } from "@/app/pages/invoice/routes";

export type AppContext = {
  session: Session | null;
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
      email: true;
    };
  }> | null;
};

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

const app = defineApp([
  async ({ request, ctx, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
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
    ctx.user = await getUser(ctx.session);
  },
  render(Document, [
    index([
      ({ ctx }) => {
        if (ctx.user) {
          console.log("redirecting to invoice list");
          return new Response(null, {
            status: 302,
            headers: { Location: link("/invoice/list") },
          });
        }
      },
      HomePage,
    ]),
    prefix("/user", userRoutes),
    prefix("/invoice", invoiceRoutes),
  ]),
]);

export default app;
