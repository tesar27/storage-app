import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import FileUploader from "@/components/file-uploader";
import { Toaster } from "@/components/ui/toaster";
import AppSearch from "@/components/app-search";
import NewHeader from "@/components/new-header";
export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }
  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset className="bg-slate-50">
        <div className="flex h-16 shrink-0 items-center gap-2 px-6 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg" />
            <Separator orientation="vertical" className="h-6 bg-slate-300" />
          </div>
          <div className="ml-auto">
            <NewHeader />
          </div>
        </div>
        <div className="p-6">{children}</div>
        <div className="pr-2 ml-auto">
          <div className="fixed z-50 bottom-6 right-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
              <FileUploader
                ownerId={currentUser.$id}
                accountId={currentUser.accountId}
              />
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
