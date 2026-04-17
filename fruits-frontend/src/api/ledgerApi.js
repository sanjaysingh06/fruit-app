import API from "./api";

export const getLedger = (accountId) =>
  API.get(`/api/ledger/${accountId}/`);