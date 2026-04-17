import API from "./api";

export const getAccounts = () => API.get("/api/accounts/");

export const createAccount = (data) =>
  API.post("/api/accounts/", data);

export const updateAccount = (id, data) =>
  API.put(`/api/accounts/${id}/`, data);

export const deleteAccount = (id) =>
  API.delete(`/api/accounts/${id}/`);

export const getAccountTypes = () =>
  API.get("/api/account-types/");