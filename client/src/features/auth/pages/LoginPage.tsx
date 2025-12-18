import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="mt-24 space-y-10 w-full">
      <h1 className="text-2xl text-center font-bold">IS-Assessments Manager</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
