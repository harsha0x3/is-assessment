import React, { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  useEffect(() => {
    console.log("IS AUTH IN LOGIN PAGE", isAuthenticated);
  }, [isAuthenticated]);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/applications");
      return;
    }
  }, [isAuthenticated]);
  return (
    <div className="mt-24 space-y-10 w-full">
      <h1 className="text-2xl text-center font-bold">IS-Assessments Manager</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
