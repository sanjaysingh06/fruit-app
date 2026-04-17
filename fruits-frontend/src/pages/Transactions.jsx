import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactionApi";
import API from "../api/api";

import TransactionModal from "../components/transactions/TransactionModal";
import TransactionDetailModal from "../components/transactions/TransactionDetailModal";

export default function Transactions() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
      setData(res.data);
    } catch {
      setMessage("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      try {
        await API.delete(`/api/transactions/${id}/`);
        fetchTransactions();
        setMessage("Transaction deleted");
      } catch {
        setMessage("Error deleting transaction");
      }
    }
  };

  const filtered = data.filter((row) => {
    const matchSearch =
      row.party_name?.toLowerCase().includes(search.toLowerCase()) ||
      row.reference?.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter
      ? row.transaction_type === typeFilter
      : true;

    const matchFrom = fromDate
      ? new Date(row.date) >= new Date(fromDate)
      : true;

    const matchTo = toDate
      ? new Date(row.date) <= new Date(toDate)
      : true;

    return matchSearch && matchType && matchFrom && matchTo;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">

      {/* 🔷 HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-3 shrink-0">

        {/* 🔹 ROW 1 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Transactions</h2>

          <button
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add
          </button>
        </div>

        {/* 🔹 ROW 2 */}
        <div className="flex flex-col md:flex-row gap-2">

          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 rounded w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded w-full md:w-40"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="SALE">Sale</option>
            <option value="PURCHASE">Purchase</option>
            <option value="PAYMENT">Payment</option>
            <option value="RECEIPT">Receipt</option>
          </select>

          <input
            type="date"
            className="border px-3 py-2 rounded w-full md:w-40"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="border px-3 py-2 rounded w-full md:w-40"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("");
              setFromDate("");
              setToDate("");
            }}
            className="border px-4 py-2 rounded hover:bg-gray-100 w-full md:w-auto"
          >
            Reset
          </button>

        </div>
      </div>

      {/* 🔄 CONTENT */}
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow p-4 overflow-hidden">

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="h-full">

            {/* 💻 TABLE */}
            <div className="hidden md:block h-full overflow-y-auto overflow-x-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Party</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Paid</th>
                    <th className="p-3 text-left">Due</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{t.date}</td>
                      <td className="p-3">{t.transaction_type}</td>
                      <td className="p-3">{t.party_name}</td>
                      <td className="p-3">₹{t.total_amount}</td>
                      <td className="p-3">₹{t.paid_amount}</td>
                      <td className="p-3 text-red-500">₹{t.due_amount}</td>

                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelected(t);
                            setDetailOpen(true);
                          }}
                          className="text-blue-500 mr-2"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setEditData(t);
                            setOpen(true);
                          }}
                          className="text-green-600 mr-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 MOBILE */}
            <div className="md:hidden h-full overflow-y-auto space-y-3">
              {filtered.map((t) => (
                <div key={t.id} className="border p-3 rounded-lg shadow-sm">
                  <div className="font-semibold">{t.party_name}</div>
                  <div className="text-sm text-gray-500">{t.date}</div>

                  <div className="mt-2 text-sm">
                    Type: {t.transaction_type}
                  </div>

                  <div>Total: ₹{t.total_amount}</div>
                  <div>Paid: ₹{t.paid_amount}</div>
                  <div className="text-red-500">Due: ₹{t.due_amount}</div>

                  <div className="flex gap-3 mt-2">
                    <button onClick={() => {
                      setSelected(t);
                      setDetailOpen(true);
                    }}>View</button>

                    <button onClick={() => {
                      setEditData(t);
                      setOpen(true);
                    }}>Edit</button>

                    <button onClick={() => handleDelete(t.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* MODALS */}
      <TransactionModal
        open={open}
        handleClose={() => setOpen(false)}
        refresh={fetchTransactions}
        editData={editData}
      />

      <TransactionDetailModal
        open={detailOpen}
        handleClose={() => setDetailOpen(false)}
        data={selected}
      />

      {/* MESSAGE */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded">
          {message}
        </div>
      )}
    </div>
  );
}