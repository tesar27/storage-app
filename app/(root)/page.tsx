import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";

import AppDropdown from "@/components/app-dropdown";
import { Chart } from "@/components/chart";
import FormattedDateTime from "@/components/formatted-datetime";
import Thumbnail from "@/components/thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { ChartPie } from "@/components/pie-chart";

const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section className="space-y-8">
        {/* Storage Analytics Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Storage Overview
            </h2>
            <p className="text-slate-600">
              Track your storage usage across different file types
            </p>
          </div>
          <ChartPie files={files} used={totalSpace.used} />
        </div>

        {/* File Type Summary Cards */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">
            File Categories
          </h3>
          <ul className="dashboard-summary-list">
            {usageSummary.map((summary) => (
              <Link
                href={summary.url}
                key={summary.title}
                className="group bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg hover:border-sky-200 transition-all duration-300 hover:scale-105 block"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl group-hover:from-sky-100 group-hover:to-blue-100 transition-colors">
                      <Image
                        src={summary.icon}
                        width={40}
                        height={40}
                        alt={`${summary.title} icon`}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {convertFileSize(summary.size) || "0 B"}
                      </h4>
                      <p className="text-sm text-slate-500">Storage used</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-lg font-medium text-slate-800 text-center mb-3">
                      {summary.title}
                    </h5>
                    <Separator className="bg-slate-200" />
                    <div className="mt-3 text-center">
                      <FormattedDateTime
                        date={summary.latestDate}
                        className="text-sm text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent Files Section */}
      <section className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Recent Files
          </h2>
          <p className="text-slate-600">Your most recently uploaded files</p>
        </div>

        {files.documents.length > 0 ? (
          <ul className="space-y-4">
            {files.documents.map((file: Models.Document) => (
              <li key={file.$id} className="group">
                <Link
                  href={file.url}
                  target="_blank"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="w-12 h-12"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                        {file.name}
                      </p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="text-sm text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <AppDropdown file={file} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-slate-600">
              Start by uploading your first file to see it here
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
