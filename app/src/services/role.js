import axios from "./axios";

export const getRoleList = () => {
  return axios.get("/api/role/list");
};
