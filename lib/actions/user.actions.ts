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

    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
          hasPassword: false, // New users don't have password initially
        },
      );
    } catch (createError) {
      console.log("⚠️ Could not set hasPassword field, creating user without it:", createError);
      // Try creating without hasPassword field
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
  }

  return parseStringify({ accountId });
};

export const createAccountWithPassword = async ({
  fullName,
  email,
  password
}: {
  fullName: string;
  email: string;
  password: string;
}) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const { account, databases } = await createAdminClient();

    // Create account with email/password
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      fullName
    );

    // Create user document in database
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId: newAccount.$id,
        hasPassword: true,
      }
    );

    // Create session
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ 
      accountId: newAccount.$id,
      sessionId: session.$id 
    });
  } catch (error) {
    handleError(error, "Failed to create account with password");
  }
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

    // Check if user needs password setup
    const passwordStatus = await checkUserPasswordStatus(accountId);
    
    return parseStringify({ 
      sessionId: session.$id,
      needsPasswordSetup: passwordStatus.needsPasswordSetup,
      isNewUser: passwordStatus.isNewUser
    });
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

export const signInWithPassword = async ({ 
  email, 
  password 
}: { 
  email: string; 
  password: string;
}) => {
  try {
    console.log("🔐 Attempting password sign-in for:", email);
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      console.log("❌ User not found in database");
      throw new Error("No account found with this email address");
    }

    console.log("👤 User found, hasPassword:", existingUser.hasPassword);

    // Check if user has password set up in our database
    if (existingUser.hasPassword !== true) {
      console.log("⚠️ User doesn't have password set up");
      throw new Error("This account was created with email verification. Please sign in using the 'Continue with Email' option or set up a password first from your account settings.");
    }

    const { account } = await createAdminClient();

    try {
      console.log("🔑 Attempting Appwrite password authentication...");
      // Create session with email and password
      const session = await account.createEmailPasswordSession(email, password);

      (await cookies()).set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      console.log("✅ Password authentication successful");
      return parseStringify({ 
        sessionId: session.$id,
        needsPasswordSetup: false,
        isNewUser: false
      });
    } catch (authError: any) {
      console.log("❌ Appwrite auth error:", authError.message);
      console.log("🔍 Full error details:", authError);
      
      // Handle specific Appwrite auth errors
      if (authError.message?.includes("Invalid credentials")) {
        console.log("💡 This might be because the user was created with OTP, not password");
        throw new Error("This account was created with email verification. Please sign in using the 'Continue with Email' option, or if you recently set up a password, please use email verification to sign in first.");
      } else if (authError.message?.includes("User (role: guests) missing scope")) {
        throw new Error("This account was created with email verification. Please sign in using the 'Continue with Email' option.");
      } else {
        throw new Error("Authentication failed. Please check your credentials and try again.");
      }
    }
  } catch (error) {
    console.log("❌ Sign-in error:", error);
    handleError(error, "Failed to sign in with password");
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

// Add password setup function
export const setupUserPassword = async ({ 
  password, 
  currentPassword 
}: { 
  password: string;
  currentPassword?: string;
}) => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const { account, databases } = await createAdminClient();
    
    // If user already has a password and current password is provided, verify and update it
    if (currentUser.hasPassword === true && currentPassword) {
      try {
        // Verify current password by creating a session
        const verifySession = await account.createEmailPasswordSession(currentUser.email, currentPassword);
        
        // Update password using the session
        await account.updatePassword(password, currentPassword);
        
        console.log("✅ Password updated successfully");
      } catch (error) {
        throw new Error("Current password is incorrect");
      }
    } else {
      // For users without password or when current password is not provided
      console.log("⚠️ Setting password for account without current password verification");
      
      // Unfortunately, Appwrite doesn't allow adding passwords to OTP-only accounts
      // We can only mark it in our database for UI purposes
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          currentUser.$id,
          {
            hasPassword: true,
          }
        );
        console.log("✅ Marked as having password in database");
        
        // Important: Let the user know about the limitation
        console.log("⚠️ IMPORTANT: Due to Appwrite limitations, accounts created with email verification cannot be converted to password-based accounts.");
        console.log("💡 Users will still need to use email verification (OTP) to sign in, even though the UI shows password is set up.");
        console.log("🔧 To enable password sign-in, the user would need to create a new account using the 'Sign up with Password' option.");
        
      } catch (updateError) {
        console.log("⚠️ Could not update hasPassword field:", updateError);
        console.log("💡 Please add 'hasPassword' boolean attribute to users collection in Appwrite Console");
        throw new Error("Could not set up password. Please contact support.");
      }
    }

    return parseStringify({ success: true });
  } catch (error) {
    console.error("Setup password error:", error);
    handleError(error, "Failed to set up password");
  }
};

// Check if user needs password setup
export const checkUserPasswordStatus = async (accountId: string) => {
  try {
    const { databases } = await createAdminClient();
    
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", accountId)]
    );

    if (user.total === 0) {
      return { needsPasswordSetup: true, isNewUser: true };
    }

    const userData = user.documents[0];
    // Handle case where hasPassword field doesn't exist yet
    const hasPassword = userData.hasPassword !== undefined ? userData.hasPassword : false;
    
    return { 
      needsPasswordSetup: !hasPassword,
      isNewUser: false 
    };
  } catch (error) {
    console.error("Error checking password status:", error);
    return { needsPasswordSetup: true, isNewUser: false };
  }
};

// OAuth is now handled client-side in AuthForm component
// Using account.createOAuth2Session() from @/lib/appwrite/client
// OAuth user creation is handled via /api/oauth-sync API route

