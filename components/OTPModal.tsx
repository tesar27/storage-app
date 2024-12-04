import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const _InputOTP = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <InputOTP value={value} onChange={onChange} maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};

const OTPModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [clicked, setClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log({ accountId, password });
    try {
      const sessionId = await verifySecret({ accountId, password });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log({ sessionId });
      if (sessionId) router.push("/");
    } catch (error) {
      console.error("Failed to verify OTP", error);
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent className="text-white justify-center ">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Enter Your OTP
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {true && (
              <>
                We&apos;ve sent a code to{" "}
                <span className="pl-1 text-brand">{email}</span>{" "}
              </>
            )}
            <_InputOTP value={password} onChange={setPassword} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white w-full">
            Cancel
          </AlertDialogCancel>
          {isLoading ? (
            <Button disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <AlertDialogAction className="w-full" onClick={handleSubmit}>
              {" "}
              Submit
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
        <div className="mt-2 text-center">
          Didn&apos;t get a code?
          <Button
            variant={"link"}
            className="pl-1 text-blue-600 w-full text-center"
            onClick={handleResendOTP}
          >
            Resend OTP
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
