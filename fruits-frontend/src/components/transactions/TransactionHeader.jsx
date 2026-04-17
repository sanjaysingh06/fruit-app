import { Grid, TextField, MenuItem } from "@mui/material";

export default function TransactionHeader({ form, setForm }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          type="date"
          fullWidth
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          select
          fullWidth
          label="Type"
          value={form.transaction_type}
          onChange={(e) =>
            setForm({
              ...form,
              transaction_type: e.target.value,
            })
          }
        >
          <MenuItem value="SALE">Sale</MenuItem>
          <MenuItem value="PURCHASE">Purchase</MenuItem>
          <MenuItem value="PAYMENT">Payment</MenuItem>
          <MenuItem value="RECEIPT">Receipt</MenuItem>
          <MenuItem value="JOURNAL">Journal</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Reference"
          fullWidth
          value={form.reference}
          onChange={(e) =>
            setForm({ ...form, reference: e.target.value })
          }
        />
      </Grid>
    </Grid>
  );
}