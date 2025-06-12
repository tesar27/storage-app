'use server';

import { ID, Models, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, getFileType, handleError, parseStringify } from "../utils";
import { InputFile } from 'node-appwrite/file';
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";
import { MAX_TOTAL_STORAGE } from "@/constants";

export const uploadFile = async ({file, ownerId, accountId, path}: UploadFileProps) => {
 const { storage, databases} = await createAdminClient();

 try {
  // Check storage limits before uploading
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // Get current storage usage
  const files = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    [Query.equal("owner", [ownerId]), Query.limit(10000)],
  );

  const currentUsage = files.documents.reduce((total, file) => total + file.size, 0);
  
  // Check if adding this file would exceed the limit
  if (currentUsage + file.size > MAX_TOTAL_STORAGE) {
    const remainingSpace = MAX_TOTAL_STORAGE - currentUsage;
    throw new Error(`Storage limit exceeded. You have ${(remainingSpace / (1024 * 1024)).toFixed(2)}MB remaining. Total limit is 10MB per user.`);
  }

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
const createQueries = (currentUser: Models.Document, types: string[], searchText: string, sort: string, limit?:number) => {
  const queries =[
    Query.or([
      Query.equal('owner', [currentUser.$id]),
      Query.contains('users', [currentUser.email]),
    ])
  ];

  if(types.length > 0) queries.push(Query.equal('type', types));
  if(searchText) queries.push(Query.contains('name', searchText));
  if(limit) queries.push(Query.limit(limit));

  if(sort) {
    const [sortBy, orderBy] = sort.split('-');
    queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
  }
  
  return queries;
}
export const getFiles = async ({types = [], searchText = '', sort = '$createdAt-desc', limit}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if(!currentUser) { throw new Error('User not found') }

    const queries = createQueries(currentUser, types, searchText, sort, limit);
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );
    return parseStringify(files);
  } catch (error) {
    handleError(error, 'Failed to get files');
  }
}

export const renameFile = async ({fileId, name, extension, path}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = name.endsWith(`.${extension}`) ? name : `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {name: newName}
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, 'Failed to rename the file');
  }
}

export const updateFileUsers = async ({fileId, emails, path}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {users: emails}
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, 'Failed to update the users in the file');
  }
}

export const deleteFile = async ({fileId, bucketFileId, path}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if(deletedFile){
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }
    revalidatePath(path);

    return parseStringify({status: 'success'});
  } catch (error) {
    handleError(error, 'Failed to update the users in the file');
  }
}

export async function getTotalSpaceUsed() {
  try {
    // Use admin client to avoid scope issues
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log("No user found for getTotalSpaceUsed");
      return { 
        image: { size: 0, latestDate: "" },
        document: { size: 0, latestDate: "" },
        video: { size: 0, latestDate: "" },
        audio: { size: 0, latestDate: "" },
        other: { size: 0, latestDate: "" },
        used: 0,
        all: MAX_TOTAL_STORAGE, // 10MB per user
      };
    }

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id]), Query.limit(10000)],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: MAX_TOTAL_STORAGE, // 10MB per user
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}