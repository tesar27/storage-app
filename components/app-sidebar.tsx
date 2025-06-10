"use client";

import { LayoutDashboard, Files, Images, Video, ChartPie } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import NavUser from "./nav-user";
import { NavMain } from "./nav-main";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: Files,
    items: [
      {
        title: "History",
        url: "#",
      },
      {
        title: "Starred",
        url: "#",
      },
      {
        title: "Settings",
        url: "#",
      },
    ],
  },
  {
    title: "Images",
    url: "/images",
    icon: Images,
  },
  {
    title: "Media",
    url: "/media",
    icon: Video,
  },
  {
    title: "Others",
    url: "/others",
    icon: ChartPie,
  },
];

interface User {
  // Define the properties of the user object here
  fullName: string;
  email: string;
  avatar: string;
}

export const AppSidebar = ({ user, ...props }: { user: User }) => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="bg-white border-r border-slate-200">
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-6 text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            CloudStore
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild>
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-all duration-200 font-medium",
                        pathname === item.url &&
                          "bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200 shadow-sm"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5",
                          pathname === item.url
                            ? "text-sky-600"
                            : "text-slate-500"
                        )}
                      />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 bg-white">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
