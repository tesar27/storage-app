"use client";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "use-debounce";

const AppSearch = () => {
  const [query, setQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = React.useState<Models.Document[]>([]);
  const router = useRouter();
  const path = usePathname();
  const [debouncedQuery] = useDebounce(query, 500);

  const closeAllmodals = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.documents);
    };

    fetchFiles();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const handleClickItem = (file: Models.Document) => {
    setResults([]);

    router.push(
      `/${
        file.type === "video" || file.type === "audio"
          ? "media"
          : file.type + "s"
      }?query=${query}`
    );
    closeAllmodals();
  };

  return (
    <div className="">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger>
          <Input placeholder="Search..." />
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px] -p-4 -border-2"
          aria-describedby={undefined}
        >
          <DialogTitle className="pt-4 text-center">Search</DialogTitle>
          <div className="pt-1">
            <Input
              className="w-full"
              placeholder="Type your query to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DialogFooter>
            <ScrollArea className="w-full border rounded-md h-72">
              <div className="p-2">
                <h4 className="mb-4 text-sm font-medium leading-none">
                  Result
                </h4>
                <ul>
                  {results.map((file) => (
                    <>
                      <li
                        key={file.$id}
                        className="p-4 text-sm hover:bg-slate-500"
                        onClick={() => handleClickItem(file)}
                      >
                        {file.name}
                      </li>
                      <Separator className="" />
                    </>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
{
  /* {open && (
        <div className="mt-2">
          RESULT
          <ul className="">
            {results.length > 0 ? (
              results.map((file) => <li key={file.$id}>{file.name}</li>)
            ) : (
              <p>No result</p>
            )}
          </ul>
        </div>
      )} */
}

export default AppSearch;
