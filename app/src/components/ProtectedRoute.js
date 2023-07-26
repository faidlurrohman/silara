import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
// import Loader from "./Loader";
// import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
	const session = useAppSelector((state) => state.session.user);
	// const [loader, setLoader] = useState(true);

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		setLoader(false);
	// 	}, 1500);
	// }, []);

	if (session) {
		return (
			// <>
			// <Loader spinning={loader} />
			children
			// </>
		);
	}

	return <Navigate to={"/auth/masuk"} replace />;
}
