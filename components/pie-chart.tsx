"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { convertFileSize } from "@/lib/utils";

const getColorForFileType = (fileType: string): string => {
  const colors: { [key: string]: string } = {
    document: "#3b82f6", // Blue
    image: "#06b6d4", // Cyan
    audio: "#8b5cf6", // Purple
    video: "#f59e0b", // Amber
    other: "#ef4444", // Red
  };
  return colors[fileType] || "#6b7280"; // Gray fallback
};

const chartConfig = {
  amount: {
    label: "Amount",
  },
  document: {
    label: "Documents",
    color: "#3b82f6",
  },
  image: {
    label: "Images",
    color: "#06b6d4",
  },
  audio: {
    label: "Media",
    color: "#8b5cf6",
  },
  video: {
    label: "Videos",
    color: "#f59e0b",
  },
  other: {
    label: "Other",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function ChartPie({ files, used }: { files: any; used: number }) {
  console.log(files.documents);
  const categorizedFiles = files.documents.reduce((acc: any, file: any) => {
    if (!acc[file.type]) {
      acc[file.type] = 0;
    }
    acc[file.type] += 1;
    return acc;
  }, {});

  const chartData = Object.keys(categorizedFiles).map((type) => ({
    fileType: type,
    amount: categorizedFiles[type],
    fill: getColorForFileType(type),
  }));

  console.log("Chart data with colors:", chartData);
  // const totalAmount = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  // }, []);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="fileType"
              innerRadius={70}
              outerRadius={120}
              strokeWidth={3}
              stroke="white"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-slate-900 text-3xl font-bold"
                        >
                          {files.total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-slate-600 text-sm"
                        >
                          Total Files
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-3 pt-6">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
          Storage Used: {convertFileSize(used)}
        </div>
        {chartData.length > 0 && (
          <div className="grid grid-cols-2 gap-4 w-full text-sm">
            {chartData.map((entry, index) => (
              <div key={entry.fileType} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-slate-600 capitalize">
                  {entry.fileType}s
                </span>
                <span className="ml-auto font-medium text-slate-900">
                  {entry.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
