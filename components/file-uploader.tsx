"use client";

import React, { MouseEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { convertFileToUrl, getFileType } from "@/lib/utils";
import Thumbnail from "./thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/actions/file.actions";
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
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
                  large. Max file size is 50MB.
                </p>
              ),
              className: "error-toast",
            });
          }
          return uploadFile({ file, ownerId, accountId, path }).then(
            (uploadedFile) => {
              if (uploadedFile) {
                setFiles((prevFiles) =>
                  prevFiles.filter((f) => f.name !== file.name)
                );
              }
            }
          );
        });
        await Promise.all(uploadPromises);
      }, 15000);
    },
    [ownerId, accountId, path]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement>,
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      {files.length > 0 ? (
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            <ul className="uploader-preview-list">
              <h4 className="h4 text-light-100">Uploading</h4>

              {files.map((file, index) => {
                const { type, extension } = getFileType(file.name);

                return (
                  <li key={`${file.name}-${index}`} className="p-2">
                    <div className="flex items-center gap-1">
                      <Thumbnail
                        type={type}
                        extension={extension}
                        url={convertFileToUrl(file)}
                      />

                      <div className="bold">
                        {file.name}
                        <Image
                          src="/assets/icons/file-loader.gif"
                          width={80}
                          height={26}
                          alt="Loader"
                        />
                      </div>
                    </div>

                    <Image
                      src="/assets/icons/remove.svg"
                      width={24}
                      height={24}
                      alt="Remove"
                      onClick={(e) => handleRemoveFile(e, file.name)}
                    />
                  </li>
                );
              })}
            </ul>
            <input {...getInputProps()} />
            <Button type="button" variant="secondary">
              <Upload /> Upload More
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <input {...getInputProps()} />
          <Button type="button" variant="secondary">
            <Upload /> Upload
          </Button>
        </>
      )}
    </div>
  );
};

export default FileUploader;
