import React, { useState } from "react";
import { useRequestPasswordResetMutation } from "../store/authApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader, Mail, ArrowLeft } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      await requestReset({ email }).unwrap();
      setSuccessMessage(
        "If an account with this email exists, a password reset code has been sent to your email.",
      );
      setTimeout(() => {
        onSuccess(email);
      }, 2000);
    } catch (err: unknown) {
      const errMsg =
        getApiErrorMessage(err) ?? "Failed to request reset password";
      setErrorMessage(errMsg);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Reset Your Password
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Enter your email address and we'll send you a code to reset your
          password
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
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Reset Code"
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

export default ForgotPasswordForm;
