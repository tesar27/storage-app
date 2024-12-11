
import { Download, ListCollapse, Share2, Trash2, UserRoundPen } from "lucide-react";
export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

  export const actionsDropdownItems = [
    {
      label: "Rename",
      icon: "/assets/icons/edit.svg",
      value: "rename",
      lucide: UserRoundPen
    },
    {
      label: "Details",
      icon: "/assets/icons/info.svg",
      value: "details",
      lucide: ListCollapse
    },
    {
      label: "Share",
      icon: "/assets/icons/share.svg",
      value: "share",
      lucide: Share2
    },
    {
      label: "Download",
      icon: "/assets/icons/download.svg",
      value: "download",
      lucide: Download
    },
    {
      label: "Delete",
      icon: "/assets/icons/delete.svg",
      value: "delete",
      lucide: Trash2
    },
  ];

  export const sortTypes = [
    {
      label: "Date created (newest)",
      value: "$createdAt-desc",
    },
    {
      label: "Created Date (oldest)",
      value: "$createdAt-asc",
    },
    {
      label: "Name (A-Z)",
      value: "name-asc",
    },
    {
      label: "Name (Z-A)",
      value: "name-desc",
    },
    {
      label: "Size (Highest)",
      value: "size-desc",
    },
    {
      label: "Size (Lowest)",
      value: "size-asc",
    },
  ];
  
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB