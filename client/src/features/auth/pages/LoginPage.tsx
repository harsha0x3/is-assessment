import React, { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";

type AuthStep = "login" | "forgot-password" | "reset-password";

const LoginPage: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/dashboard";
  const fromSearch = location.state?.from?.search || "";
  const from = `${fromPath}${fromSearch}`;

  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleForgotPasswordClick = () => {
    setAuthStep("forgot-password");
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setResetEmail(email);
    setAuthStep("reset-password");
  };

  const handleResetPasswordSuccess = () => {
    setAuthStep("login");
    setResetEmail("");
  };

  const handleBackToLogin = () => {
    setAuthStep("login");
    setResetEmail("");
  };

  return (
    <div className="space-y-10 w-full h-screen bg-linear-to-br from-30% from-primary/90 to-30% to-card flex flex-col sm:flex-row">
      <div className="sm:mr-5">
        <h1 className="text-4xl text-center font-bold w-full mt-20">
          IS-Assessments Manager
        </h1>
        {/* <img src="/is_logo.svg" alt="" /> */}
      </div>

      <div className="flex w-full h-full items-center">
        {authStep === "login" && (
          <LoginForm onForgotPasswordClick={handleForgotPasswordClick} />
        )}

        {authStep === "forgot-password" && (
          <ForgotPasswordForm
            onBack={handleBackToLogin}
            onSuccess={handleForgotPasswordSuccess}
          />
        )}

        {authStep === "reset-password" && resetEmail && (
          <ResetPasswordForm
            email={resetEmail}
            onBack={handleBackToLogin}
            onSuccess={handleResetPasswordSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
