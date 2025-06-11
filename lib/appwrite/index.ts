"use server";

import { Account, Avatars, Client, Databases, Storage } from 'node-appwrite';
import { appwriteConfig } from './config';
import { cookies } from 'next/headers';

export const createSessionClient = async () => {
  console.log("🔧 Creating session client...");
  const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

  const cookieStore = await cookies();
  const session = cookieStore.get('appwrite-session');
  
  console.log("🍪 Session cookie found:", !!session?.value);
  console.log("🔍 Cookie details:", {
    exists: !!session,
    hasValue: !!session?.value,
    valueLength: session?.value?.length || 0,
    cookieName: session?.name,
  });

  if (!session || !session.value) {
    console.log("❌ No session cookie available");
    return null;
  }

  console.log("✅ Setting session on client with value:", session.value.substring(0, 20) + "...");
  client.setSession(session.value); 

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    
  }
}

export const createAdminClient = async () => {
  const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.secretKey);
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  }
}
