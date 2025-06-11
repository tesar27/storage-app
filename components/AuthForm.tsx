"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  createAccount,
  sendEmailOTP,
  signInUser,
} from "@/lib/actions/user.actions";
import { account, OAuthProvider } from "@/lib/appwrite/client";
import OTPModal from "./OTPModal";
import Link from "next/link";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) =>
  z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
  });

export const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState("");
  // 1. Define your form.
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true);
    setErrorMessage("");
    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      setAccountId(user.accountId);
    } catch {
      setErrorMessage("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = () => {
    const email = form.getValues("email");
    sendEmailOTP({ email });
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    console.log(`🚀 Starting OAuth with ${provider}`);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const providerMap = {
        google: OAuthProvider.Google,
        github: OAuthProvider.Github,
      };

      // Use client-side account to create OAuth2 session
      const successUrl = `${window.location.origin}/`;
      const failureUrl = `${window.location.origin}/sign-in?error=oauth_failed`;

      console.log("📋 OAuth URLs:");
      console.log("  Success:", successUrl);
      console.log("  Failure:", failureUrl);

      // This will redirect the user to the OAuth provider
      await account.createOAuth2Session(
        providerMap[provider],
        successUrl,
        failureUrl
      );
    } catch (error) {
      console.error(`❌ OAuth ${provider} error:`, error);
      setErrorMessage(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {type === "sign-in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-slate-600">
            {type === "sign-in"
              ? "Sign in to access your secure storage"
              : "Join thousands of users managing their files securely"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* OAuth Buttons - TEMPORARILY DISABLED 
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn("google")}
                className="w-full h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn("github")}
                className="w-full h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with email
                </span>
              </div>
            </div>
            */}

            {type === "sign-up" && (
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      className="h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : type === "sign-in" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            {errorMessage && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-slate-600">
                {type === "sign-in"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <Link
                  href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                  className="ml-1 font-medium text-sky-600 hover:text-sky-700 transition-colors"
                >
                  {type === "sign-in" ? "Sign up" : "Sign in"}
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>

      {accountId && (
        <OTPModal accountId={accountId} email={form.getValues("email")} />
      )}
    </>
  );
};
