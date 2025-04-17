import { route } from "@redwoodjs/sdk/router";
import { LoginPage } from "./LoginPage";
import { sessions } from "@/session/store";

export const userRoutes = [
  route("/login", LoginPage),
  route("/logout", async function ({ request, headers }) {
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
