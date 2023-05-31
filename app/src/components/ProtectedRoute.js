import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import useRole from "../hooks/useRole";
import { MENU_ACCESS } from "../helpers/constants";

export default function ProtectedRoute({ children }) {
	const session = useAppSelector((state) => state.session.user);
	const { role_id } = useRole();
	const location = useLocation();

	if (session) {
		if (
			MENU_ACCESS[role_id][0] !== "all" &&
			!MENU_ACCESS[role_id].includes(location?.pathname || "/")
		) {
			return <Navigate to={"/restricted"} replace />;
		}

		return children;
	}

	return <Navigate to={"/auth/masuk"} replace />;
}
