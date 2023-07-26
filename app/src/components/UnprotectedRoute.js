import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
// import { useEffect, useState } from "react";
// import Loader from "./Loader";

export default function UnprotectedRoute({ children }) {
	const session = useAppSelector((state) => state.session.user);
	// const [loader, setLoader] = useState(true);

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		setLoader(false);
	// 	}, 1500);
	// }, []);

	if (session) {
		return <Navigate to={"/"} replace />;
	}

	return (
		// <>
		// <Loader spinning={loader} />
		children
		// </>
	);
}
