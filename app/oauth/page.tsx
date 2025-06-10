import { createAdminClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { avatarPlaceholderUrl } from "@/constants";

const OAuthCallback = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const userId = searchParams.userId as string;
  const secret = searchParams.secret as string;

  console.log(
    "OAuth callback - userId:",
    userId,
    "secret:",
    secret ? "present" : "missing"
  );

  if (!userId || !secret) {
    console.error("Missing userId or secret in OAuth callback");
    redirect("/sign-in?error=missing_credentials");
  }

  try {
    const { account, databases } = await createAdminClient();

    // Create session using the OAuth credentials
    const session = await account.createSession(userId, secret);
    console.log("Session created:", session.$id);

    // Set the session cookie
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Get user account details
    const accountDetails = await account.get();
    console.log("Account details:", accountDetails.email);

    // Check if user exists in our database
    const existingUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", accountDetails.$id)]
    );

    // If user doesn't exist, create them
    if (existingUser.total === 0) {
      console.log("Creating new user in database");
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName: accountDetails.name || "User",
          email: accountDetails.email,
          avatar: avatarPlaceholderUrl,
          accountId: accountDetails.$id,
        }
      );
    } else {
      console.log("User already exists in database");
    }

    redirect("/");
  } catch (error) {
    console.error("OAuth callback error:", error);
    redirect("/sign-in?error=oauth_callback_failed");
  }
};

export default OAuthCallback;
