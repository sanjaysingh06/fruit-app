import API from "./api";

export const getTransactions = () =>
  API.get("/api/transactions/");

export const createTransaction = (data) =>
  API.post("/api/transactions/", data);