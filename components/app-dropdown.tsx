"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EllipsisVertical, Loader2 } from "lucide-react";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { FileDetails, ShareInput } from "./actions-modal-content";

const AppDropdown = ({ file }: { file: Models.Document }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const path = usePathname();

  useEffect(() => {
    if (isModalOpen) {
      setName(file.name); // Reset name state when modal opens
    }
  }, [isModalOpen, file.name]);

  const closeAllmodals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    // setEmails([]);
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    await delay(2500);
    let success = false;

    const actions = {
      rename: async () => {
        await renameFile({
          fileId: file.$id,
          name,
          extension: file.extension,
          path,
        });
        return true;
      },
      share: async () => {
        await updateFileUsers({ fileId: file.$id, emails, path });
        return true;
      },
      delete: async () => {
        await deleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        });
        return true;
      },
    };
    success = await actions[action.value as keyof typeof actions]();
    console.log("success", success);
    if (success) closeAllmodals();
    setIsLoading(false);
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;
    return (
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
            {value === "details" && <FileDetails file={file} />}
            {value === "share" && (
              <ShareInput
                onInputChange={setEmails}
                onRemove={handleRemoveUser}
                file={file}
              />
            )}
            {value === "delete" && (
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{file.name}</span>?
              </p>
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
                {isLoading && <Loader2 className="animate-spin" />}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);
    // TODO: Add owner and admin rights on removing users
    // if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
    //   console.error('Permission denied');
    //   return false;
    // }
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllmodals();
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
