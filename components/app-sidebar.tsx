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
      <SidebarContent>
        {/* <NavMain items={items} /> */}
        <SidebarGroup>
          <SidebarGroupLabel className="p-6 text-3xl">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild>
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "p-6",
                        pathname === item.url && "bg-white text-black"
                      )}
                    >
                      <item.icon />
                      <span className="text-lg">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
