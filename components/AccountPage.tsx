"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  setupUserPassword,
  getCurrentUser,
  signOutUser,
} from "@/lib/actions/user.actions";
import { Loader2, User, Lock, Mail, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface UserData {
  $id: string;
  fullName: string;
  email: string;
  avatar: string;
  hasPassword?: boolean;
  $createdAt: string;
}

export const AccountPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/sign-in");
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/sign-in");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);

    try {
      await setupUserPassword({
        password: values.newPassword,
      });

      // Update local user state
      setUser((prev) => (prev ? { ...prev, hasPassword: true } : null));

      // Clear form
      form.reset();

      toast({
        title: "Password setup completed",
        description:
          user.hasPassword === true
            ? "Your password has been updated. Note: You may still need to use email verification to sign in due to platform limitations."
            : "Your password has been set up. Note: You may still need to use email verification to sign in initially.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      console.error("Password update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-slate-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Account Settings
        </h1>
        <p className="text-slate-600">
          Manage your account information and security settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Information */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {user.fullName}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Member since {new Date(user.$createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-1 mt-2">
                <Lock className="w-4 h-4" />
                Password: {user.hasPassword === true ? "Set up" : "Not set up"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Password Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {user.hasPassword === true
                ? "Change Password"
                : "Set Up Password"}
            </CardTitle>
            <CardDescription>
              {user.hasPassword === true
                ? "Set a new password for your account (Note: Due to platform limitations, you may still need to use email verification to sign in)"
                : "Set up a password for additional security"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {user.hasPassword === true
                          ? "New Password"
                          : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a secure password"
                          type="password"
                          className="h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm your password"
                          type="password"
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {user.hasPassword === true
                          ? "Updating password..."
                          : "Setting up password..."}
                      </span>
                    </div>
                  ) : user.hasPassword === true ? (
                    "Update Password"
                  ) : (
                    "Set Up Password"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-500">
                    Your password should be at least 8 characters long
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
