import React, { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useResetPasswordMutation } from "../store/authApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Loader, Lock, ArrowLeft } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { getApiErrorMessage } from "@/utils/handleApiError";

interface ResetPasswordFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  onBack,
  onSuccess,
}) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    try {
      await resetPassword({
        email,
        otp,
        new_password: newPassword,
      }).unwrap();

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err) ?? "Failed to reset password";
      setErrorMessage(errMsg);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Enter Reset Code & New Password
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Check your email for the reset code
        </p>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <p className="text-green-700 dark:text-green-300 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Code */}
          <div className="grid gap-2">
            <Label htmlFor="otp">Reset Code (6 digits)</Label>
            <InputOTP
              id="otp"
              maxLength={6}
              value={otp}
              pattern={REGEXP_ONLY_DIGITS}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* New Password */}
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PasswordInput
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className=""
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className=""
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || !otp || !newPassword || !confirmPassword}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
