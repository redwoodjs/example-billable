"use client";

import { useState, useTransition } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
  validateEmailAddress,
} from "./functions";
import { Layout } from "../Layout";
import { Button } from "@/app/components/ui/button";
import { RouteOptions } from "@/worker";
import { Input } from "@/app/components/ui/input";

export function LoginPage({ appContext }: RouteOptions) {
  const [email, setEmail] = useState("peter.pistorius@gmail.com");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyLogin();

    // 2. Ask the browser to sign the challenge
    const login = await startAuthentication({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the login process
    const success = await finishPasskeyLogin(login);

    if (!success) {
      setResult("Login failed");
    } else {
      setResult("Login successful!");
    }

    // redirect to invoice list
  };

  const passkeyRegister = async () => {
    const [valid, message] = await validateEmailAddress(email);
    if (!valid) {
      setResult(message as string);
      return;
    }

    // 1. Get a challenge from the worker
    const options = await startPasskeyRegistration(email);
    console.log("options", options);

    // 2. Ask the browser to sign the challenge
    const registration = await startRegistration({ optionsJSON: options });
    console.log("registration", registration);

    // 3. Give the signed challenge to the worker to finish the registration process
    const success = await finishPasskeyRegistration(email, registration);
    console.log("success", success);
    if (!success) {
      setResult("Registration failed");
    } else {
      setResult("Registration successful!");
    }

    // redirect to invoice list
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <Layout appContext={appContext}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <br />
      <Button onClick={handlePerformPasskeyLogin} disabled={isPending}>
        {isPending ? <>...</> : "Login"}
      </Button>{" "}
      <Button onClick={handlePerformPasskeyRegister} disabled={isPending}>
        {isPending ? <>...</> : "Register"}
      </Button>
      {result && <div>{result}</div>}
    </Layout>
  );
}
