import {
  CLEAR_SESSION,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  OVERRIDE_USER_ACTION,
} from "../types";

const initialState = {
  request_login: { loading: false, message: null, errors: null },
  user: null,
};

export default function sessionReducer(state = initialState, action) {
  const { type, errors, message, user } = action;

  switch (type) {
    case OVERRIDE_USER_ACTION:
      return {
        ...state,
        user: { ...state.user, ...user },
      };
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        request_login: {
          ...state.request_login,
          loading: true,
        },
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        request_login: {
          ...state.request_login,
          loading: false,
          message: null,
          errors: null,
        },
        user,
      };
    case CLEAR_SESSION:
      return initialState;
    default:
      return state;
  }
}
