import API from "./api";

export const getCrateLedger = (accountId) =>
  API.get(`/api/crate-ledger/${accountId}/`);