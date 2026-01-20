import React, { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useLoginMutation } from "../store/authApiSlice";
import { setError, selectAuth, loginSuccess } from "../store/authSlice";
import type { LoginRequest } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Loader, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./PasswordInput";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/utils/handleApiError";

interface LoginFormProps {
  onForgotPasswordClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPasswordClick }) => {
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const { control, register, handleSubmit, reset } = useForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
      mfa_code: "",
    },
  });
  const emailOrUsername = useWatch({ control, name: "email" });
  const password = useWatch({ control, name: "password" });

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    try {
      const result = await login(data).unwrap();
      if (result?.data) {
        dispatch(loginSuccess(result.data));
        reset();
      }
      navigate("/dashboard");
      return;
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err) ?? "Login Failed";
      dispatch(setError(errMsg));
    }
  };
  return (
    <Card className="w-full max-w-md mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          Login to your Account
        </CardTitle>
      </CardHeader>

      {auth.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{auth.error}</p>
        </div>
      )}

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email/Username */}
          <div className="grid gap-2">
            <Label>Email or Username</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                {...register("email", { required: true })}
                placeholder="Enter email or username"
                className="pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              {onForgotPasswordClick && (
                <button
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <PasswordInput
                {...register("password", { required: true })}
                placeholder="Enter password"
                className=""
              />
            </div>
          </div>

          {/* MFA Code */}
          <div className="grid gap-2">
            <Label htmlFor="mfa_code">MFA Code</Label>
            <Controller
              control={control}
              name="mfa_code"
              render={({ field }) => (
                <InputOTP
                  {...field}
                  id="mfa_code"
                  maxLength={6}
                  value={field.value ?? ""}
                  pattern={REGEXP_ONLY_DIGITS}
                  onChange={(val: string) => field.onChange(val)}
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
              )}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || !emailOrUsername || !password}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
