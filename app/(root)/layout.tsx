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
      <SidebarInset>
        <div className="flex h-16 shrink-0 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
          </div>
          <div className="ml-auto">
            <NewHeader />
          </div>
        </div>
        <div className="px-4"> {children} </div>
        <div className="pr-2 ml-auto">
          <div className="fixed z-50 bottom-4 right-4">
            <div className="bg-white rounded-lg shadow-lg ">
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
