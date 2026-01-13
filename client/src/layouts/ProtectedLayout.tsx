//src/layouts/ProtectedLayout.tsx

import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsLoading,
} from "@/features/auth/store/authSlice";
import { Loader } from "lucide-react";

const ProtectedLayout: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      console.log("NOT LOGGED IN");
      return;
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent">
        <Loader className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
