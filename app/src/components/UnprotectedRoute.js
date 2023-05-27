import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";

export default function UnprotectedRoute({ children }) {
  const session = useAppSelector((state) => state.session.user);

  if (session) {
    return <Navigate to={"/"} replace />;
  }

  return children;
}
