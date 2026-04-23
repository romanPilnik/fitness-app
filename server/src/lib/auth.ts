import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendAuthEmail } from "./authEmail";

const requireEmailVerification = process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification,
    /**
     * Password reset: user receives link to server `/api/auth/reset-password/:token?callbackURL=...`
     * which redirects to the SPA with `?token=`.
     */
    sendResetPassword: async ({ user, url }, _request) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Reset your password",
        text: `You requested a password reset.\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
      });
    },
  },
  /**
   * Email verification link when signing up (and re-send in UI if implemented).
   * Do not `await` long SMTP in production without `runInBackground` (Better Auth uses void pattern).
   */
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Please verify your email address:\n\n${url}\n\nIf you did not create an account, you can ignore this email.`,
      });
    },
  },
  session: {
    modelName: "authSession",
    /**
     * Short-lived signed payload in a cookie; DB is source of truth for sessions.
     * `maxAge` (seconds) controls cache TTL before re-fetching the session.
     */
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  /**
   * Built-in per-route limits on `/api/auth/*` (e.g. sign-in, password reset request).
   * Tune here if you see 429s in normal use.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  account: {
    /**
     * Google + email/password: allow linking the same person without duplicate accounts
     * when the provider is trusted. Adjust `trustedProviders` if you add more OAuth.
     */
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      units: {
        type: "string",
        required: false,
        defaultValue: "metric",
      },
      weekStartsOn: {
        type: "string",
        required: false,
        defaultValue: "sunday",
      },
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  trustedOrigins: [process.env.CLIENT_ORIGIN ?? "http://localhost:5173"],
});
