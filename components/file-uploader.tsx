"use client";

import React, { MouseEvent, useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { convertFileToUrl, getFileType, convertFileSize } from "@/lib/utils";
import Thumbnail from "./thumbnail";
import { MAX_FILE_SIZE, MAX_TOTAL_STORAGE } from "@/constants";
import { toast } from "@/hooks/use-toast";
import { Upload, HardDrive } from "lucide-react";
import { uploadFile, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const [storageUsage, setStorageUsage] = useState<{
    used: number;
    total: number;
  } | null>(null);

  // Load storage usage on component mount
  useEffect(() => {
    const loadStorageUsage = async () => {
      try {
        const totalSpace = await getTotalSpaceUsed();
        setStorageUsage({
          used: totalSpace?.used || 0,
          total: MAX_TOTAL_STORAGE,
        });
      } catch (error) {
        console.error("Error loading storage usage:", error);
      }
    };
    loadStorageUsage();
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      // Check total storage limit before uploading
      try {
        const totalSpace = await getTotalSpaceUsed();
        const currentUsage = totalSpace?.used || 0;
        const totalNewFilesSize = acceptedFiles.reduce(
          (acc, file) => acc + file.size,
          0
        );

        if (currentUsage + totalNewFilesSize > MAX_TOTAL_STORAGE) {
          setFiles([]);
          return toast({
            description: (
              <p className="text-white body-2">
                Storage limit exceeded. You have{" "}
                {((MAX_TOTAL_STORAGE - currentUsage) / (1024 * 1024)).toFixed(
                  2
                )}
                MB remaining. Total limit is 10MB per user.
              </p>
            ),
            className: "error-toast",
          });
        }
      } catch (error) {
        console.error("Error checking storage limits:", error);
      }

      // Do something with the files
      setTimeout(async () => {
        var uploadPromises = acceptedFiles.map(async (file) => {
          if (file.size > MAX_FILE_SIZE) {
            setFiles((prevFiles) =>
              prevFiles.filter((f) => f.name !== file.name)
            );

            return toast({
              description: (
                <p className="text-white body-2">
                  <span className="font-semibold">{file.name}</span> is too
                  large. Max file size is 1MB.
                </p>
              ),
              className: "error-toast",
            });
          }
          return uploadFile({ file, ownerId, accountId, path })
            .then((uploadedFile) => {
              if (uploadedFile) {
                setFiles((prevFiles) =>
                  prevFiles.filter((f) => f.name !== file.name)
                );

                // Update storage usage after successful upload
                setStorageUsage((prev) =>
                  prev
                    ? {
                        ...prev,
                        used: prev.used + file.size,
                      }
                    : null
                );
              }
            })
            .catch((error) => {
              // Remove file from list on error
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name)
              );

              // Show error toast
              toast({
                description: (
                  <p className="text-white body-2">
                    <span className="font-semibold">{file.name}:</span>{" "}
                    {error.message || "Upload failed"}
                  </p>
                ),
                className: "error-toast",
              });
            });
        });
        await Promise.all(uploadPromises);
      }, 15000);
    },
    [ownerId, accountId, path]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLElement>,
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      {/* Storage Usage Indicator */}
      {storageUsage && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Storage Usage
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {convertFileSize(storageUsage.used)} /{" "}
              {convertFileSize(storageUsage.total)}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storageUsage.used / storageUsage.total > 0.8
                  ? "bg-red-500"
                  : storageUsage.used / storageUsage.total > 0.6
                    ? "bg-yellow-500"
                    : "bg-sky-500"
              }`}
              style={{
                width: `${Math.min((storageUsage.used / storageUsage.total) * 100, 100)}%`,
              }}
            />
          </div>
          {storageUsage.used / storageUsage.total > 0.8 && (
            <p className="text-xs text-red-600 mt-1">
              Warning: Storage almost full. Only{" "}
              {convertFileSize(storageUsage.total - storageUsage.used)}{" "}
              remaining.
            </p>
          )}
        </div>
      )}

      {files.length > 0 ? (
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">
              Uploading Files
            </h4>
            <p className="text-sm text-slate-600">
              Please wait while your files are being uploaded...
            </p>
          </div>

          <ul className="space-y-3 mb-4">
            {files.map((file, index) => {
              const { type, extension } = getFileType(file.name);

              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                    className="w-10 h-10"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Image
                        src="/assets/icons/file-loader.gif"
                        width={60}
                        height={20}
                        alt="Uploading..."
                        className="object-contain"
                      />
                      <span className="text-xs text-slate-500">
                        Uploading...
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemoveFile(e, file.name)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      width={20}
                      height={20}
                      alt="Remove"
                      className="opacity-60 hover:opacity-100"
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <input {...getInputProps()} />
          <Button
            type="button"
            variant="outline"
            className="w-full border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload More Files
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <input {...getInputProps()} />
          <Button
            type="button"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
