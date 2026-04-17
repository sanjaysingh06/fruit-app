import { Grid, TextField, MenuItem } from "@mui/material";

export default function TransactionPayment({
  form,
  setForm,
  totalAmount,
  accounts,
}) {
  const filteredAccounts =
    form.transaction_type === "SALE"
      ? accounts.filter((a) => a.role === "CUSTOMER")
      : form.transaction_type === "PURCHASE"
      ? accounts.filter((a) => a.role === "VENDOR")
      : accounts;

  const partyLabel =
    form.transaction_type === "SALE"
      ? "Customer"
      : form.transaction_type === "PURCHASE"
      ? "Vendor"
      : "Account";

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label={partyLabel}
          value={form.party_account || ""}
          onChange={(e) =>
            setForm({
              ...form,
              party_account: e.target.value,
            })
          }
        >
          <MenuItem value="">Select {partyLabel}</MenuItem>

          {filteredAccounts.map((acc) => (
            <MenuItem key={acc.id} value={acc.id}>
              {acc.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Total"
          value={
            form.transaction_type === "SALE" ||
            form.transaction_type === "PURCHASE"
              ? totalAmount
              : form.payment_amount
          }
          disabled
          fullWidth
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Amount"
          type="number"
          value={form.payment_amount || ""}
          onChange={(e) =>
            setForm({
              ...form,
              payment_amount: e.target.value,
            })
          }
          fullWidth
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          select
          label="Mode"
          value={form.payment_mode}
          onChange={(e) =>
            setForm({
              ...form,
              payment_mode: e.target.value,
            })
          }
          fullWidth
        >
          <MenuItem value="CASH">Cash</MenuItem>
          <MenuItem value="BANK">Bank</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );
}