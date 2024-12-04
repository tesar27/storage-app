import Link from "next/link";
import { Models } from "node-appwrite";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppDropdown from "./app-dropdown";
import { ExternalLink } from "lucide-react";

const AppCard = ({ file }: { file: Models.Document }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="w-2/3">{file.name}</span>
          <div className="flex justify-end w-1/3 space-x-2">
            <Link href={file.url} target="_blank" className="flex items-center">
              <ExternalLink />
            </Link>
            <AppDropdown file={file} />
          </div>
        </CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
};

export default AppCard;
