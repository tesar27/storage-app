import AppCard from "@/components/app-card";
import Sort from "@/components/sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getFileTypesParams } from "@/lib/utils";
import { Models } from "node-appwrite";
import React from "react";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types: types, searchText, sort });

  return (
    <div className="pt-8">
      <section className="w-full ">
        <h1 className="flex text-lg font-bold capitalize">
          {type}
          <p className="">
            {" "}
            Total: <span>0 MB</span>
          </p>

          <p className="hidden sm:block"> Sort by:</p>
          <div className="ml-auto">
            <Sort />{" "}
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
