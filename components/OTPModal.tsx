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

const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Signing you in...
        </h3>
        <p className="text-sm text-slate-600 text-center">
          Please wait while we set up your account
        </p>
      </div>
    </div>
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
  const [errorMessage, setErrorMessage] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log({ accountId, password });

    try {
      const result = await verifySecret({ accountId, password });
      console.log({ result });
      if (result) {
        // Show loading overlay while redirecting
        setShowLoadingOverlay(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if user needs password setup
        if (result.needsPasswordSetup) {
          console.log("User needs password setup, redirecting...");
          router.push("/setup-password");
        } else {
          console.log("User authenticated, redirecting to dashboard...");
          router.push("/");
        }

        // Close modal after successful verification
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      setErrorMessage("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  const handleResendOTP = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <>
      <LoadingOverlay isVisible={showLoadingOverlay} />
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-md bg-white border-slate-200">
          <AlertDialogHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 mb-2">
              Enter Verification Code
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="font-medium text-sky-600">{email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-center py-6">
            <_InputOTP
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrorMessage(""); // Clear error when user types
              }}
            />
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          <AlertDialogFooter className="flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
            <AlertDialogCancel className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            {isLoading ? (
              <Button
                disabled
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white"
              >
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </Button>
            ) : (
              <AlertDialogAction
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0"
                onClick={handleSubmit}
              >
                Verify Code
              </AlertDialogAction>
            )}
          </AlertDialogFooter>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 mb-2">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="ghost"
              className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 p-0 h-auto font-medium"
              onClick={handleResendOTP}
            >
              Resend verification code
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OTPModal;
