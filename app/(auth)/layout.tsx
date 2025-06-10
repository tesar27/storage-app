import Image from "next/image";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand section */}
      <section className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className="mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Your files,
              <br />
              <span className="text-sky-200">secure & organized</span>
            </h1>
            <p className="text-lg xl:text-xl text-sky-100 leading-relaxed max-w-md">
              Store, manage, and share your files with enterprise-grade security
              and intuitive organization.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sky-100">End-to-end encryption</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-sky-100">Lightning fast uploads</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <span className="text-sky-100">Seamless collaboration</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 backdrop-blur-sm rounded-full"></div>
        <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full"></div>
      </section>

      {/* Right side - Form section */}
      <section className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 bg-slate-50">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </section>
    </div>
  );
};

export default Layout;
