import axios from "./axios";

export const getAccount = (which) => {
  return axios.get(`/api/account_${which}/data`);
};

export const getAccountList = (which) => {
  return axios.get(`/api/account_${which}/list`);
};

export const addAccount = (which, values) => {
  return axios.post(`/api/account_${which}/add`, {
    ...values,
    active: values?.active ? "true" : "false",
  });
};

export const removeAccount = (which, id) => {
  return axios.delete(`/api/account_${which}/remove/${id}`);
};
