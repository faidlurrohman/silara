import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggin = true;

  if (isLoggin) {
    return children;
  }

  return <Navigate to={"/auth/login"} replace />;
}
