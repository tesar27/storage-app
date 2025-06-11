"use server";

import { ID, Query, OAuthProvider } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    console.log("Email OTP sent", session);
    console.log("user id ", session.userId);
    
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("🔍 Getting current user...");
    const sessionClient = await createSessionClient();
    
    // No session exists
    if (!sessionClient) {
      console.log("❌ No session client available");
      return null;
    }

    const { account } = sessionClient;

    try {
      console.log("📱 Getting account details...");
      const result = await account.get();
      console.log("👤 Account details:", result.email);

      // Use admin client to query database to avoid scope issues
      console.log("🔍 Looking for user in database using admin client...");
      const { databases } = await createAdminClient();
      
      const user = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId", result.$id)],
      );

      console.log("📊 User query result:", user.total);

      if (user.total <= 0) {
        console.log("❌ User not found in database");
        return null;
      }

      console.log("✅ User found in database:", user.documents[0].email);
      return parseStringify(user.documents[0]);
    } catch (scopeError) {
      console.log("⚠️ Account scope error, trying fallback API...");
      
      // If we have scope issues, try the fallback API
      try {
        const response = await fetch('/api/get-current-user', {
          method: 'GET',
          headers: {
            'Cookie': `appwrite-session=${(await cookies()).get('appwrite-session')?.value}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            console.log("✅ User found via fallback API:", userData.user.email);
            return userData.user;
          }
        }
      } catch (apiError) {
        console.log("❌ Fallback API failed:", apiError);
      }
      
      throw scopeError;
    }
  } catch (error) {
    console.log("❌ Error getting current user:", error);
    return null;
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const signOutUser = async () => {
  try {
    console.log("🚪 Signing out user...");
    
    // Clear server-side session
    const sessionClient = await createSessionClient();
    if (sessionClient) {
      const { account } = sessionClient;
      await account.deleteSession("current");
    }
    
    // Clear session cookie
    (await cookies()).delete("appwrite-session");
    
    console.log("✅ User signed out successfully");
  } catch (error) {
    console.log("⚠️ Error during sign out:", error);
    // Still clear the cookie even if session deletion fails
    (await cookies()).delete("appwrite-session");
  } finally {
    redirect("/sign-in");
  }
};

// OAuth is now handled client-side in AuthForm component
// Using account.createOAuth2Session() from @/lib/appwrite/client
// OAuth user creation is handled via /api/oauth-sync API route

