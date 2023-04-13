import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggin = false;

  if (isLoggin) {
    return children;
  }

  return <Navigate to={"/auth/login"} replace />;
}
