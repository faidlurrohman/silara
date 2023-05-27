import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";

export default function ProtectedRoute({ children }) {
  const session = useAppSelector((state) => state.session.user);

  if (session) {
    return children;
  }

  return <Navigate to={"/auth/masuk"} replace />;
}
