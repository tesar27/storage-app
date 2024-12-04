'use server';

import { ID, Models, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, getFileType, handleError, parseStringify } from "../utils";
import { InputFile } from 'node-appwrite/file';
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

export const uploadFile = async ({file, ownerId, accountId, path}: UploadFileProps) => {
 const { storage, databases} = await createAdminClient();

 try {
  const inputFile = InputFile.fromBuffer(file, file.name);

  const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile)

  const fileDocument = {
    type: getFileType(bucketFile.name).type,
    name: bucketFile.name,
    url: constructFileUrl(bucketFile.$id),
    extension: getFileType(bucketFile.name).extension,
    size: bucketFile.sizeOriginal,
    owner: ownerId,
    accountId,
    users: [],
    bucketFileId: bucketFile.$id,
  }

  const newFile = await databases.createDocument(
    appwriteConfig.databaseId, 
    appwriteConfig.filesCollectionId,
    ID.unique(), 
    fileDocument).catch(async (error: unknown) => {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id); 
      handleError(error, "Failed to create file document")
    });
    revalidatePath(path);
    return parseStringify(newFile);
 } catch (error) {
  handleError(error, 'Failed to upload the file');
 }
}
const createQueries = (currentUser: Models.Document) => {
  const queries =[
    Query.or([
      Query.equal('owner', [currentUser.$id]),
      Query.contains('users', [currentUser.email]),
    ])
  ];
   // TODO: search, sort, limits...

  return queries;
}
export const getFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if(!currentUser) { throw new Error('User not found') }

    const queries = createQueries(currentUser);
    console.log({currentUser, queries})
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );
    console.log(files);
    return parseStringify(files);
  } catch (error) {
    handleError(error, 'Failed to get files');
  }
}