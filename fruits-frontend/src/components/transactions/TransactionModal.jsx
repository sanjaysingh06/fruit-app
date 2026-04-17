import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import API from "../../api/api";

import TransactionHeader from "./TransactionHeader";
import TransactionItems from "./TransactionItems";
import TransactionPayment from "./TransactionPayment";

export default function TransactionModal({
  open,
  handleClose,
  refresh,
  editData,
}) {
  const [accounts, setAccounts] = useState([]);

  const [form, setForm] = useState({
    date: "",
    transaction_type: "SALE",
    reference: "",
    narration: "",
    items: [],
    party_account: "",
    payment_amount: 0,
    payment_mode: "CASH",
  });

  useEffect(() => {
    if (open) fetchAccounts();
  }, [open]);

  // 🔥 PREFILL EDIT DATA
  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        transaction_type: editData.transaction_type,
        reference: editData.reference || "",
        narration: editData.narration || "",
        items: editData.items || [],
        party_account: getPartyId(editData),
        payment_amount: editData.paid_amount || 0,
        payment_mode: editData.payment_mode || "CASH",
      });
    }
  }, [editData]);

  const fetchAccounts = async () => {
    const res = await API.get("accounts/");
    setAccounts(res.data);
  };

  const getPartyId = (data) => {
    const entry = data.entries.find(
      (e) => e.account_role === "CUSTOMER" || e.account_role === "VENDOR"
    );
    return entry?.account || "";
  };

  const totalAmount = form.items.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  );

  const getAccount = (role) =>
    accounts.find((a) => a.role === role)?.id;

  const generateEntries = () => {
    const entries = [];

    const total = Number(totalAmount);
    const payment = Number(form.payment_amount || 0);
    const party = Number(form.party_account);

    const SALES = getAccount("SALES");
    const PURCHASE = getAccount("PURCHASE");
    const CASH = getAccount("CASH");
    const BANK = getAccount("BANK");

    const paymentAcc =
      form.payment_mode === "CASH" ? CASH : BANK;

    if (form.transaction_type === "SALE") {
      entries.push({ account: party, debit: total, credit: 0 });
      entries.push({ account: SALES, debit: 0, credit: total });

      if (payment > 0) {
        entries.push({ account: paymentAcc, debit: payment, credit: 0 });
        entries.push({ account: party, debit: 0, credit: payment });
      }
    }

    if (form.transaction_type === "PURCHASE") {
      entries.push({ account: PURCHASE, debit: total, credit: 0 });
      entries.push({ account: party, debit: 0, credit: total });

      if (payment > 0) {
        entries.push({ account: party, debit: payment, credit: 0 });
        entries.push({ account: paymentAcc, debit: 0, credit: payment });
      }
    }

    if (form.transaction_type === "PAYMENT") {
      entries.push({ account: party, debit: payment, credit: 0 });
      entries.push({ account: paymentAcc, debit: 0, credit: payment });
    }

    if (form.transaction_type === "RECEIPT") {
      entries.push({ account: paymentAcc, debit: payment, credit: 0 });
      entries.push({ account: party, debit: 0, credit: payment });
    }

    return entries;
  };

  const handleSubmit = async () => {
    const payload = {
      date: form.date,
      transaction_type: form.transaction_type,
      reference: form.reference,
      narration: form.narration,
      items:
        form.transaction_type === "SALE" ||
        form.transaction_type === "PURCHASE"
          ? form.items
          : [],
      entries: generateEntries(),
    };

    if (editData) {
      await API.put(`transactions/${editData.id}/`, payload);
    } else {
      await API.post("transactions/", payload);
    }

    refresh();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editData ? "Edit Transaction" : "Add Transaction"}
      </DialogTitle>

      <DialogContent>
        <TransactionHeader form={form} setForm={setForm} />

        {(form.transaction_type === "SALE" ||
          form.transaction_type === "PURCHASE") && (
          <TransactionItems form={form} setForm={setForm} />
        )}

        <TransactionPayment
          form={form}
          setForm={setForm}
          totalAmount={totalAmount}
          accounts={accounts}
        />

        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          {editData ? "Update" : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}