import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 OAuth sync API called");
    const { sessionSecret, userId, userEmail, userName } = await request.json();
    
    console.log("📋 OAuth sync data:", { 
      userId, 
      userEmail, 
      userName,
      hasSessionSecret: !!sessionSecret 
    });

    if (!sessionSecret || !userId || !userEmail) {
      console.error("❌ Missing required OAuth data");
      return NextResponse.json(
        { success: false, error: "Missing required OAuth data" },
        { status: 400 }
      );
    }

    console.log("🍪 Setting session cookie with value:", sessionSecret.substring(0, 20) + "...");

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", sessionSecret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Wait a moment for the cookie to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify cookie was set by reading it back
    const verificationCookie = cookieStore.get("appwrite-session");
    console.log("🔍 Cookie verification after setting:", {
      exists: !!verificationCookie,
      hasValue: !!verificationCookie?.value,
      valueLength: verificationCookie?.value?.length || 0,
      matches: verificationCookie?.value === sessionSecret,
    });
    
    if (!verificationCookie || verificationCookie.value !== sessionSecret) {
      console.error("❌ Cookie was not set properly!");
      return NextResponse.json(
        { success: false, error: "Failed to set session cookie" },
        { status: 500 }
      );
    }

    // Use admin client to check/create user in database (avoid scope issues)
    const { databases } = await createAdminClient();

    // Check if user exists in our database using admin client
    console.log("🔍 Checking if user exists in database...");
    const existingUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", userId)]
    );

    console.log("📊 Existing user query result:", existingUser.total);

    // Create user in database if doesn't exist
    if (existingUser.total === 0) {
      console.log("➕ Creating OAuth user in database...");
      try {
        const newUser = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          ID.unique(),
          {
            fullName: userName,
            email: userEmail,
            avatar: avatarPlaceholderUrl,
            accountId: userId,
            hasPassword: true, // OAuth users already have authentication set up
          }
        );
        console.log("✅ OAuth user created successfully:", newUser.$id);
      } catch (createError) {
        console.log("⚠️ Could not set hasPassword field, creating user without it:", createError);
        // Try creating without hasPassword field
        const newUser = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          ID.unique(),
          {
            fullName: userName,
            email: userEmail,
            avatar: avatarPlaceholderUrl,
            accountId: userId,
          }
        );
        console.log("✅ OAuth user created successfully (without hasPassword):", newUser.$id);
      }
    } else {
      console.log("✅ OAuth user already exists in database");
    }

    console.log("🎉 OAuth sync completed successfully");
    
    // Create response with cookie set in multiple ways for maximum compatibility
    const response = NextResponse.json({ 
      success: true,
      sessionInfo: {
        userId,
        userEmail,
        cookieSet: true
      }
    });
    
    // Set cookie in response headers as well (belt and suspenders approach)
    const cookieValue = `appwrite-session=${sessionSecret}; Path=/; HttpOnly; SameSite=lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
    response.headers.set("Set-Cookie", cookieValue);
    
    console.log("🍪 Cookie also set in response headers:", cookieValue.substring(0, 50) + "...");

    return response;
  } catch (error) {
    console.error("❌ OAuth sync API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}