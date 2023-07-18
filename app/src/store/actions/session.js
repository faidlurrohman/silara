import Cookies from "js-cookie";
import {
	CLEAR_SESSION,
	LOGIN_USER_FAILURE,
	LOGIN_USER_REQUEST,
	LOGIN_USER_SUCCESS,
} from "../types";
import { doLogin } from "../../services/auth";

export const loginAction = (user) => (dispatch) => {
	dispatch({ type: LOGIN_USER_REQUEST });

	doLogin(user).then((response) => {
		if (response?.data?.code === 0) {
			Cookies.set(
				process.env.REACT_APP_ACCESS_TOKEN,
				response?.data?.data?.token,
				{ expires: 1, sameSite: "Strict" }
				// {
				// 	expires: new Date(new Date().getTime() + 15 * 1000),
				// 	// sameSite: "Strict",
				// }
			);
			dispatch({
				type: LOGIN_USER_SUCCESS,
				user: { ...response?.data?.data, username: user?.username },
			});
		} else {
			dispatch({ type: LOGIN_USER_FAILURE });
		}
	});
};

export const logoutAction = () => (dispatch) => {
	Cookies.remove(process.env.REACT_APP_ACCESS_TOKEN);
	dispatch({ type: CLEAR_SESSION });
};
