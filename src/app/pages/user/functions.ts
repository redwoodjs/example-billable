"use server";

import { verifyTurnstileToken } from "@redwoodjs/sdk/turnstile";
import { requestInfo } from "@redwoodjs/sdk/worker";
import { env } from "cloudflare:workers";

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

import { sessions } from "@/session/store";
import { db } from "@/db";

export async function validateEmailAddress(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    return [false, "Email address already exists"];
  } else {
    return [true, ""];
  }
}

export async function startPasskeyRegistration(email: string) {
  const { headers } = requestInfo;

  const options = await generateRegistrationOptions({
    rpName: env.APP_NAME,
    rpID: env.RP_ID,
    userName: email,
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  console.log("options function", options);

  await sessions.save(headers, { challenge: options.challenge });

  return options;
}

export async function finishPasskeyRegistration(
  email: string,
  registration: RegistrationResponseJSON
) {
  const { request, headers } = requestInfo;

  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const verification = await verifyRegistrationResponse({
    response: registration,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return false;
  }

  await sessions.save(headers, { challenge: null });

  const user = await db.user.create({
    data: {
      email,
    },
  });

  await db.credential.create({
    data: {
      userId: user.id,
      credentialId: verification.registrationInfo.credential.id,
      publicKey: verification.registrationInfo.credential.publicKey,
      counter: verification.registrationInfo.credential.counter,
    },
  });

  return true;
}

export async function startPasskeyLogin() {
  const { headers } = requestInfo;

  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "preferred",
    allowCredentials: [],
  });

  await sessions.save(headers, { challenge: options.challenge });

  return options;
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON) {
  const { request, headers } = requestInfo;
  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const credential = await db.credential.findUnique({
    where: {
      credentialId: login.id,
    },
  });

  if (!credential) {
    return false;
  }

  const verification = await verifyAuthenticationResponse({
    response: login,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.RP_ID,
    requireUserVerification: false,
    credential: {
      id: credential.credentialId,
      publicKey: credential.publicKey,
      counter: credential.counter,
    },
  });

  if (!verification.verified) {
    return false;
  }

  await db.credential.update({
    where: {
      credentialId: login.id,
    },
    data: {
      counter: verification.authenticationInfo.newCounter,
    },
  });

  const user = await db.user.findUnique({
    where: {
      id: credential.userId,
    },
  });

  if (!user) {
    return false;
  }

  await sessions.save(headers, {
    userId: user.id,
    challenge: null,
  });

  return true;
}
