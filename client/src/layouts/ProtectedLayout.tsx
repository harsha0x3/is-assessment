import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRefreshTokenMutation } from "@/features/auth/store/authApiSlice";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RootState } from "@/store/rootStore";
const ProtectedLayout = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const [refreshAuth, { isLoading: isRefreshing }] = useRefreshTokenMutation();
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  // Run refresh ONCE
  useEffect(() => {
    const check = async () => {
      try {
        await refreshAuth().unwrap();
      } catch {
        // ignore
      } finally {
        setAuthChecked(true);
      }
    };

    check();
  }, []);

  // 🔥 If refresh not completed yet → stay on loading state
  if (!authChecked || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // 🔥 THIS LOG WILL NOW RUN
  console.log("IS AUTH:", isAuthenticated);

  // Only redirect *after* auth check is done
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
