import React, { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";

const LoginPage: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/dashboard";
  const fromSearch = location.state?.from?.search || "";
  const from = `${fromPath}${fromSearch}`;
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="mt-24 space-y-10 w-full">
      <h1 className="text-2xl text-center font-bold">IS-Assessments Manager</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
