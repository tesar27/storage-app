import Image from "next/image";
import { Models } from "node-appwrite";
import React from "react";
import Thumbnail from "./thumbnail";
import FormattedDateTime from "./formatted-datetime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ImageThumbnail = ({ file }: { file: Models.Document }) => {
  return (
    <div className="flex">
      <Thumbnail type={file.type} extension={file.extension} url={file.url} />
      <div className="flex flex-col">
        <p>{file.name}</p>
        <FormattedDateTime date={file.$createdAt} className="caption" />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <p className="">{label}</p>
    <p className="">{value}</p>
  </div>
);
export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="px-2 pt-2 space-y-4">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div>
        <p className="pl-1">Share file with other users</p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
        />
        <div className="pt-4">
          <div className="flex justify-between">
            <p className=""> Share with</p>
            <p className=""> {file.users.length} users</p>
          </div>
          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li key={email} className="">
                <div className="flex justify-between">
                  <p>{email}</p>
                  <Button onClick={() => onRemove(email)} className="bg-white">
                    {" "}
                    <Image
                      src="/assets/icons/remove.svg"
                      alt="Remove"
                      width={24}
                      height={24}
                    />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export const SearchInput = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const [query, setQuery] = React.useState("");
  return (
    <div className="flex">
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={() => onSearch(query)}>Search</Button>
    </div>
  );
};
