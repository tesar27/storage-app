"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite/client";
import { useRouter, usePathname } from "next/navigation";

export default function OAuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent multiple calls
      if (isProcessing) {
        console.log("⏳ OAuth already processing, skipping...");
        return;
      }

      console.log("🎯 OAuthHandler triggered on path:", pathname);

      try {
        // Check if user is authenticated via OAuth
        console.log("🔍 Checking for OAuth session...");
        const session = await account.getSession("current");
        console.log("✅ OAuth session found:", session.$id);
        console.log("🔍 Session object keys:", Object.keys(session));
        console.log("🔍 Session secret exists:", !!session.secret);

        const user = await account.get();
        console.log("👤 OAuth user authenticated:", user.email);

        setIsProcessing(true);

        // Get the session secret - try different possible properties
        const sessionSecret = session.secret || session.$id;

        if (!sessionSecret) {
          console.error(
            "❌ No session secret found in session object:",
            session
          );
          throw new Error("Session secret not available");
        }

        console.log(
          "🔑 Using session identifier:",
          sessionSecret.substring(0, 10) + "..."
        );

        // Create a server action to sync the session
        console.log("🔄 Syncing OAuth session with server...");
        const response = await fetch("/api/oauth-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.$id,
            sessionSecret: sessionSecret,
            userId: user.$id,
            userEmail: user.email,
            userName: user.name || user.email,
          }),
        });

        console.log("📡 OAuth sync response status:", response.status);
        const result = await response.json();
        console.log("📋 OAuth sync result:", result);

        if (response.ok && result.success) {
          console.log("✅ OAuth session synced successfully");
          console.log("🔄 Waiting 4 seconds for cookie to be processed...");

          // Wait for cookie to be processed by browser
          setTimeout(() => {
            console.log("🔄 Navigating to dashboard to complete OAuth flow...");
            window.location.href = "/";
          }, 4000);
        } else {
          console.error("❌ Failed to sync OAuth session:", result.error);
          window.location.href = "/sign-in?error=oauth_sync_failed";
        }
      } catch (error) {
        console.log("ℹ️ No OAuth session found or error:", error);
        // Only redirect to sign-in if we're not already there and user tried OAuth
        if (pathname !== "/sign-in" && pathname !== "/sign-up") {
          console.log("🔄 Redirecting to sign-in (no session found)");
          // Don't redirect immediately on first load, let the page handle it
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Add a small delay to ensure DOM and Appwrite client are ready
    const timer = setTimeout(handleOAuthCallback, 1000);

    return () => clearTimeout(timer);
  }, [router, pathname, isProcessing]);

  // Show loading state while processing OAuth
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
          <span>Completing sign in...</span>
        </div>
      </div>
    );
  }

  return null;
}
