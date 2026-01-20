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
    <div className="mt-24 space-y-10 w-full">
      <h1 className="text-2xl text-center font-bold">IS-Assessments Manager</h1>

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
  );
};

export default LoginPage;
