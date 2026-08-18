import { z } from "zod";

import { AUTH_INTENTS } from "@/features/auth/constants";

export const authIntentSchema = z.enum(AUTH_INTENTS);

export type AuthIntent = z.infer<typeof authIntentSchema>;
export type AuthMode = Extract<
  AuthIntent,
  typeof AUTH_INTENTS.login | typeof AUTH_INTENTS.signup
>;

const credentialFields = {
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
};

export const authFormSchema = z
  .object({
    mode: z.enum([AUTH_INTENTS.login, AUTH_INTENTS.signup]),
    name: z.string().optional(),
    ...credentialFields,
    confirmPassword: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.mode !== AUTH_INTENTS.signup) return;

    if (!values.name?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Enter your name",
        path: ["name"],
      });
    }

    if (!values.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Confirm your password",
        path: ["confirmPassword"],
      });
      return;
    }

    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;

export const authActionSchema = z
  .discriminatedUnion("intent", [
    z.object({
      intent: z.literal(AUTH_INTENTS.login),
      ...credentialFields,
    }),
    z.object({
      intent: z.literal(AUTH_INTENTS.signup),
      name: z.string().trim().min(1, "Enter your name"),
      ...credentialFields,
      confirmPassword: z.string().min(1, "Confirm your password"),
    }),
    z.object({ intent: z.literal(AUTH_INTENTS.google) }),
    z.object({ intent: z.literal(AUTH_INTENTS.github) }),
    z.object({ intent: z.literal(AUTH_INTENTS.logout) }),
  ])
  .superRefine((values, context) => {
    if (
      values.intent === AUTH_INTENTS.signup &&
      values.password !== values.confirmPassword
    ) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
