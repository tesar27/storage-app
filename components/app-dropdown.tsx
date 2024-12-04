"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { EllipsisVertical } from "lucide-react";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const AppDropdown = ({ file }: { file: Models.Document }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);

  const closeAllmodals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    // setEmails([]);
  };

  const handleAction = async () => {};

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;
    return (
      <DialogContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {value === "rename" && (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
            </DialogDescription>
          </DialogHeader>
          {["rename", "delete", "share"].includes(value) && (
            <DialogFooter className="flex">
              <div className="flex justify-center gap-3">
                <Button onClick={closeAllmodals} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleAction}>
                  <p className="capitalize">{value}</p>
                  {isLoading && (
                    <Image
                      src="assets/icons/loading.svg"
                      alt="loading"
                      width={20}
                      height={20}
                    />
                  )}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{file.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => {
            const IconComponent = actionItem.lucide;

            return (
              <DropdownMenuItem
                key={actionItem.value}
                onClick={() => {
                  console.log("clicked");
                  setAction(actionItem);
                  if (
                    ["rename", "share", "delete", "details"].includes(
                      actionItem.value
                    )
                  ) {
                    setIsModalOpen(true);
                  }
                }}
              >
                {actionItem.value === "download" ? (
                  <Link
                    href={constructDownloadUrl(file.bucketFileId)}
                    download={file.name}
                    className="flex items-center gap-2"
                  >
                    {IconComponent && <IconComponent className="icon" />}
                    {actionItem.label}
                  </Link>
                ) : (
                  <>
                    {IconComponent && <IconComponent className="icon" />}
                    {actionItem.label}{" "}
                  </>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default AppDropdown;
