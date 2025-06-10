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
