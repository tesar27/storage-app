"use client";

import { Client, Account, OAuthProvider } from "appwrite";
import { appwriteConfig } from "./config";

export const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);

export { OAuthProvider };
