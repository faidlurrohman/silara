import Cookies from "js-cookie";
import {
  CLEAR_SESSION,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
} from "../types";

export const loginAction = (user) => (dispatch) => {
  dispatch({ type: LOGIN_USER_REQUEST });

  setTimeout(() => {
    Cookies.set(process.env.REACT_APP_ACCESS_TOKEN, "@_#_TOKEN_VALUE_#_@", {
      expires: 1,
      sameSite: "Strict",
    });
    dispatch({ type: LOGIN_USER_SUCCESS, user: user });
  }, 3000);
};

export const logoutAction = () => (dispatch) => {
  Cookies.remove(process.env.REACT_APP_ACCESS_TOKEN);
  dispatch({ type: CLEAR_SESSION });
};
