import Image from "next/image";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="items-center justify-center hidden w-1/2 p-10 bg-black lg:flex xl:w-2/5">
        <div>
          {/* <Image
            src="/logo.png"
            alt="logo"
            width={60}
            height={60}
            className="h-auto"
          /> */}
          <div className="space-y-5 text-white">
            <h1 className="h1"> Manage you files the best way</h1>
            <p className="">Store your files in a secure way</p>
          </div>
        </div>
      </section>
      <section className="flex flex-col items-center flex-1 p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        {children}
      </section>
    </div>
  );
};

export default Layout;
