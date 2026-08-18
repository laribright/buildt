"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, GitBranch, Mail } from "lucide-react";
import { useController, useForm, useFormState } from "react-hook-form";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAction } from "@/features/auth/action";
import { AUTH_INTENTS } from "@/features/auth/constants";
import {
  authFormSchema,
  type AuthFormValues,
  type AuthMode,
} from "@/features/auth/schema";
import type { AuthActionState } from "@/features/auth/types";

type AuthStep = "providers" | "credentials";

const initialAuthActionState: AuthActionState = {
  success: false,
  message: null,
};

const authFieldNames = ["name", "email", "password", "confirmPassword"] as const;

const emptyAuthValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
} as const;

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(AUTH_INTENTS.signup);
  const [step, setStep] = useState<AuthStep>("providers");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [actionState, submitAction, isPending] = useActionState(
    authAction,
    initialAuthActionState,
  );

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    mode: "all",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      mode: AUTH_INTENTS.signup,
      ...emptyAuthValues,
    },
  });
  const { errors } = useFormState({ control: form.control });
  const nameField = useController({
    control: form.control,
    name: "name",
  });
  const emailField = useController({
    control: form.control,
    name: "email",
  });
  const passwordField = useController({
    control: form.control,
    name: "password",
  });
  const confirmPasswordField = useController({
    control: form.control,
    name: "confirmPassword",
  });
  const nameError = errors.name?.message;
  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;
  const confirmPasswordError = errors.confirmPassword?.message;

  useEffect(() => {
    const fieldErrors = actionState.fieldErrors;
    if (!fieldErrors) return;

    for (const name of authFieldNames) {
      const message = fieldErrors[name]?.[0];
      if (message) {
        form.setError(name, { type: "server", message });
      }
    }
  }, [actionState, form]);

  function resetCredentials(nextMode: AuthMode) {
    setMode(nextMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    form.reset({
      mode: nextMode,
      ...emptyAuthValues,
    });
  }

  function openDialog(nextMode: AuthMode) {
    setStep("providers");
    resetCredentials(nextMode);
    setIsOpen(true);
  }

  function changeMode(nextMode: AuthMode) {
    resetCredentials(nextMode);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setStep("providers");
      resetCredentials(AUTH_INTENTS.signup);
    }
  }

  function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    const result = authFormSchema.safeParse(form.getValues());

    if (result.success) return;

    event.preventDefault();

    for (const issue of result.error.issues) {
      const name = issue.path[0];
      if (
        name === "name" ||
        name === "email" ||
        name === "password" ||
        name === "confirmPassword"
      ) {
        form.setError(name, { type: "client", message: issue.message });
      }
    }
  }

  return (
    <>
      <nav
        className="flex items-center gap-4 text-sm sm:gap-8 sm:text-base"
        aria-label="Account"
      >
        <Button variant="ghost" onClick={() => openDialog(AUTH_INTENTS.login)}>
          Log in
        </Button>
        <Button
          className="h-auto rounded-xl px-4 py-3 text-sm shadow-md sm:px-5 sm:text-base"
          onClick={() => openDialog(AUTH_INTENTS.signup)}
        >
          Create account
        </Button>
      </nav>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-7 sm:min-h-152 sm:max-w-sm sm:content-center">
          {step === "credentials" && (
            <Button
              className="absolute top-2 left-2"
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Back to sign-in options"
              onClick={() => setStep("providers")}
            >
              <ArrowLeft />
            </Button>
          )}

          {step === "providers" ? (
            <div
              key="providers"
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 motion-safe:duration-300"
            >
              <DialogHeader className="items-center gap-2 pt-5 text-center">
                <BrandMark />
                <DialogTitle className="mt-4 text-2xl font-bold">
                  Welcome to <span className="text-primary">Buildt</span>
                </DialogTitle>
                <DialogDescription>
                  Build and deploy full-stack apps with AI.
                </DialogDescription>
              </DialogHeader>

              <form action={submitAction} className="mt-8 grid gap-3">
                <Button
                  className="h-12 justify-center gap-3 px-5"
                  type="submit"
                  name="intent"
                  value={AUTH_INTENTS.github}
                  variant="outline"
                  disabled={isPending}
                >
                  <GitBranch className="size-5" aria-hidden="true" />
                  <span>Continue with GitHub</span>
                </Button>
                <Button
                  className="h-12 justify-center gap-3 px-5"
                  type="submit"
                  name="intent"
                  value={AUTH_INTENTS.google}
                  variant="outline"
                  disabled={isPending}
                >
                  <span
                    className="grid size-5 place-items-center rounded-full border border-border text-xs font-bold"
                    aria-hidden="true"
                  >
                    G
                  </span>
                  <span>Continue with Google</span>
                </Button>
                <Button
                  className="h-12 justify-center gap-3 px-5"
                  type="button"
                  variant="outline"
                  onClick={() => setStep("credentials")}
                >
                  <Mail className="size-5" aria-hidden="true" />
                  <span>Continue with Email</span>
                </Button>
              </form>

              <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to our{" "}
                <a className="text-primary hover:underline" href="#terms">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-primary hover:underline" href="#privacy">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          ) : (
            <div
              key="credentials"
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-300"
            >
              <DialogHeader className="items-center gap-2 pt-12 text-center">
                <DialogTitle className="text-2xl font-bold">
                  {mode === AUTH_INTENTS.signup
                    ? "Create your account"
                    : "Welcome back"}
                </DialogTitle>
                <DialogDescription>
                  {mode === AUTH_INTENTS.signup
                    ? "Enter your details to get started"
                    : "Enter your details to log in"}
                </DialogDescription>
              </DialogHeader>

              <form
                action={submitAction}
                className="mt-8 grid gap-5"
                noValidate
                onSubmit={handleCredentialsSubmit}
              >
                {mode === AUTH_INTENTS.signup && (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-name">Name</Label>
                    <Input
                      id="auth-name"
                      className="h-10"
                      type="text"
                      placeholder="Codewithlari"
                      autoComplete="name"
                      aria-invalid={Boolean(nameError)}
                      aria-describedby={
                        nameError ? "auth-name-error" : undefined
                      }
                      {...nameField.field}
                    />
                    {nameError && (
                      <p
                        className="text-xs font-medium text-destructive"
                        id="auth-name-error"
                        role="alert"
                      >
                        {nameError}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    className="h-10"
                    type="email"
                    placeholder="test@test.com"
                    autoComplete="email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError ? "auth-email-error" : undefined
                    }
                    {...emailField.field}
                  />
                  {emailError && (
                    <p
                      className="text-xs font-medium text-destructive"
                      id="auth-email-error"
                      role="alert"
                    >
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="auth-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      className="h-10 pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete={
                        mode === AUTH_INTENTS.signup
                          ? "new-password"
                          : "current-password"
                      }
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={
                        passwordError ? "auth-password-error" : undefined
                      }
                      {...passwordField.field}
                    />
                    <Button
                      className="absolute top-1/2 right-1 -translate-y-1/2"
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  {passwordError && (
                    <p
                      className="text-xs font-medium text-destructive"
                      id="auth-password-error"
                      role="alert"
                    >
                      {passwordError}
                    </p>
                  )}
                </div>

                {mode === AUTH_INTENTS.signup && (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-confirm-password">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="auth-confirm-password"
                        className="h-10 pr-10"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(confirmPasswordError)}
                        aria-describedby={
                          confirmPasswordError
                            ? "auth-confirm-password-error"
                            : undefined
                        }
                        {...confirmPasswordField.field}
                      />
                      <Button
                        className="absolute top-1/2 right-1 -translate-y-1/2"
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={() =>
                          setShowConfirmPassword((visible) => !visible)
                        }
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {confirmPasswordError && (
                      <p
                        className="text-xs font-medium text-destructive"
                        id="auth-confirm-password-error"
                        role="alert"
                      >
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="mt-1 h-10 w-full"
                  type="submit"
                  name="intent"
                  value={mode}
                  disabled={isPending}
                >
                  {isPending
                    ? "Submitting..."
                    : mode === AUTH_INTENTS.signup
                      ? "Create account"
                      : "Log in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === AUTH_INTENTS.signup
                  ? "Already have an account?"
                  : "Need an account?"}{" "}
                <Button
                  className="h-auto p-0 align-baseline"
                  type="button"
                  variant="link"
                  onClick={() =>
                    changeMode(
                      mode === AUTH_INTENTS.signup
                        ? AUTH_INTENTS.login
                        : AUTH_INTENTS.signup,
                    )
                  }
                >
                  {mode === AUTH_INTENTS.signup ? "Log in" : "Create account"}
                </Button>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
