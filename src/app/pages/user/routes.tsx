import { route } from "rwsdk/router";
import { LoginPage } from "./LoginPage";
import { sessionStore } from "@/worker";

export const userRoutes = [
  route("/login", LoginPage),
  route("/logout", async function ({ request, headers }) {
    await sessionStore.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
