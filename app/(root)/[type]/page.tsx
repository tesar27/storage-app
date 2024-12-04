import AppCard from "@/components/app-card";
import Sort from "@/components/sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import React from "react";

const Page = async ({ params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const files = await getFiles();

  return (
    <div className="">
      <section className="w-full">
        <h1 className="text-3xl font-bold capitalize">
          {type}
          <div className="">
            <p className="">
              {" "}
              Total: <span>0 MB</span>
            </p>

            <div className="flex">
              <p className="hidden sm:block"> Sort by:</p>
              <Sort />
            </div>
          </div>
        </h1>
      </section>

      {files.total > 0 ? (
        <section className="flex gap-5">
          {files.documents.map((file: Models.Document) => (
            <AppCard key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p>No files found</p>
      )}
    </div>
  );
};

export default Page;
