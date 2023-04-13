import { Navigate } from "react-router-dom";

export default function UnprotectedRoute({ children }) {
  const isLoggin = true;

  if (isLoggin) {
    return <Navigate to={"/"} replace />;
  }

  return children;
}
