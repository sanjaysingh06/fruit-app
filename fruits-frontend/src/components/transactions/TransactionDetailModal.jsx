import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

export default function TransactionDetailModal({
  open,
  handleClose,
  data,
}) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Transaction Details</DialogTitle>

      <DialogContent>

        {/* 🔷 BASIC INFO */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
          <div><b>Date:</b> {data.date}</div>

          <div>
            <b>Type:</b>{" "}
            <Chip label={data.transaction_type} size="small" />
          </div>

          <div><b>Ref:</b> {data.reference || "-"}</div>

          <div><b>Party:</b> {data.party_name}</div>

          <div><b>Total:</b> ₹{data.total_amount}</div>

          <div><b>Paid:</b> ₹{data.paid_amount}</div>

          <div><b>Due:</b> ₹{data.due_amount}</div>

          <div><b>Mode:</b> {data.payment_mode || "-"}</div>
        </div>

        <Divider sx={{ my: 2 }} />

        {/* 📦 ITEMS */}
        {data.items && data.items.length > 0 && (
          <div className="mb-4">
            <Typography variant="h6" mb={1}>
              Items
            </Typography>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Weight</th>
                    <th className="p-2 text-left">Rate</th>
                    <th className="p-2 text-left">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{item.item_name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.weight}</td>
                      <td className="p-2">₹{item.rate}</td>
                      <td className="p-2 font-medium">
                        ₹{item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="border p-3 rounded">
                  <div className="font-medium">{item.item_name}</div>
                  <div className="text-sm">
                    Qty: {item.quantity} | Weight: {item.weight}
                  </div>
                  <div className="text-sm">
                    Rate: ₹{item.rate}
                  </div>
                  <div className="font-semibold">
                    Amount: ₹{item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💰 ENTRIES */}
        <div>
          <Typography variant="h6" mb={1}>
            Accounting Entries
          </Typography>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Account</th>
                  <th className="p-2 text-left">Debit</th>
                  <th className="p-2 text-left">Credit</th>
                </tr>
              </thead>

              <tbody>
                {data.entries.map((e, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{e.account_name}</td>
                    <td className="p-2 text-red-500">
                      {e.debit ? `₹${e.debit}` : "-"}
                    </td>
                    <td className="p-2 text-green-600">
                      {e.credit ? `₹${e.credit}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {data.entries.map((e, i) => (
              <div key={i} className="border p-3 rounded">
                <div className="font-medium">{e.account_name}</div>
                <div className="text-red-500">
                  Debit: {e.debit ? `₹${e.debit}` : "-"}
                </div>
                <div className="text-green-600">
                  Credit: {e.credit ? `₹${e.credit}` : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}