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

const getColorForFileType = (fileType: string): string => {
  const colors: { [key: string]: string } = {
    document: "var(--color-document)",
    image: "var(--color-image)",
    audio: "var(--color-audio)",
    video: "var(--color-video)",
    other: "var(--color-other)",
  };
  return colors[fileType] || "var(--color-default)";
};

const chartConfig = {
  amount: {
    label: "Amount",
  },
  document: {
    label: "Documents",
    color: "hsl(var(--chart-1))",
  },
  image: {
    label: "Images",
    color: "hsl(var(--chart-2))",
  },
  audio: {
    label: "Media",
    color: "hsl(var(--chart-3))",
  },
  video: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
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
  // const totalAmount = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  // }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
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
              innerRadius={60}
              strokeWidth={5}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {files.total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Amount
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
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total space used {used} KB
        </div>
      </CardFooter>
    </Card>
  );
}
