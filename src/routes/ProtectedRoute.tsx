
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAppSelector(
    (state) => state.auth
  );

  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="users-state">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
