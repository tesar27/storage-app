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
        <DialogTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search files..."
              className="pl-10 pr-4 h-10 w-80 bg-white border-slate-200 rounded-xl shadow-sm hover:border-sky-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
            />
          </div>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-lg border-0 shadow-2xl rounded-2xl"
          aria-describedby={undefined}
        >
          <DialogTitle className="text-xl font-semibold text-slate-900 text-center mb-4">
            Search Files
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10 pr-4 h-12 w-full bg-white border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
              placeholder="Type your query to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <ScrollArea className="w-full border border-slate-200 rounded-xl h-80 bg-slate-50">
              <div className="p-4">
                <h4 className="mb-4 text-sm font-semibold text-slate-700">
                  Search Results
                </h4>
                {results.length > 0 ? (
                  <ul className="space-y-2">
                    {results.map((file) => (
                      <li key={file.$id}>
                        <button
                          className="w-full p-3 text-sm text-left hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200"
                          onClick={() => handleClickItem(file)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                              <Search className="w-4 h-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500 capitalize">
                                {file.type}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600">No files found</p>
                    <p className="text-sm text-slate-500">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-sky-500" />
                    </div>
                    <p className="text-slate-600">Start typing to search</p>
                    <p className="text-sm text-slate-500">
                      Find your files quickly
                    </p>
                  </div>
                )}
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
