import Header from "@/components/Header";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import FileUploader from "@/components/file-uploader";
import { Toaster } from "@/components/ui/toaster";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }
  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="pr-2 ml-auto">
            <div className="fixed z-50 hidden lg:block bottom-4 right-4">
              <div className="bg-white rounded-lg shadow-lg ">
                <FileUploader
                  ownerId={currentUser.$id}
                  accountId={currentUser.accountId}
                />
              </div>
            </div>
          </div>
        </header>
        <div className="px-4"> {children} </div>
        {/* <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
          <div className="grid gap-4 auto-rows-min md:grid-cols-3">
            <div className="bg-[#18181C] aspect-video rounded-xl" />
            <div className="bg-[#18181C] aspect-video rounded-xl" />
            <div className="bg-[#18181C] aspect-video rounded-xl" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl  bg-[#18181C] md:min-h-min" />
        </div> */}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
