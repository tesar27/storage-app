"use client";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOutUser } from "@/lib/actions/user.actions";

const NavUser = ({
  user,
}: {
  user: {
    fullName: string;
    email: string;
    avatar: string;
  };
}) => {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-slate-50 data-[state=open]:text-sky-600 hover:bg-slate-50 border border-slate-200 rounded-xl mx-2 mb-2"
            >
              <Avatar className="w-8 h-8 rounded-lg border border-slate-200">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate text-slate-900">
                  {user.fullName}
                </span>
                <span className="text-xs truncate text-slate-600">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-slate-200 bg-white shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg border border-slate-200">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate text-slate-900">
                    {user.fullName}
                  </span>
                  <span className="text-xs truncate text-slate-600">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg mx-1">
                <Sparkles className="text-sky-500" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-slate-700 hover:bg-slate-50 rounded-lg mx-1">
                <BadgeCheck className="text-slate-500" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700 hover:bg-slate-50 rounded-lg mx-1">
                <CreditCard className="text-slate-500" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700 hover:bg-slate-50 rounded-lg mx-1">
                <Bell className="text-slate-500" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem
              onClick={async () => await signOutUser()}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg mx-1"
            >
              <LogOut className="text-red-500" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavUser;
