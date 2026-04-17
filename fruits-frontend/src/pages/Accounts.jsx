import { useEffect, useState } from "react";
import AccountTable from "../components/accounts/AccountTable";
import AccountModal from "../components/accounts/AccountModal";

import { getAccounts, deleteAccount } from "../api/accountApi";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // ✅ NEW
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔄 Fetch Accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Delete (soft delete handled backend)
  const handleDelete = async (id) => {
    if (window.confirm("Delete this account?")) {
      try {
        await deleteAccount(id);
        fetchAccounts();
        setMessage("Account deleted successfully");
      } catch {
        setMessage("Error deleting account");
      }
    }
  };

  // 🔍 Filter logic
  const filtered = accounts.filter((acc) => {
    const matchSearch = acc.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchRole = roleFilter
      ? acc.role === roleFilter
      : true;

    return matchSearch && matchRole;
  });

  return (
    <div>
      {/* 🔷 Header */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          {/* Title */}
          <h2 className="text-2xl font-bold">Accounts</h2>

          {/* Filters + Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

            {/* Search */}
            <input
              type="text"
              placeholder="Search account..."
              className="border px-3 py-2 rounded w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Role Filter */}
            <select
              className="border px-3 py-2 rounded"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="SALES">Sales</option>
              <option value="PURCHASE">Purchase</option>
            </select>

            {/* Reset */}
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
              }}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Reset
            </button>

            {/* Add */}
            <button
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              + Add Account
            </button>

          </div>
        </div>
      </div>

      {/* 🔄 Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading...
        </div>
      ) : (
        <AccountTable
          data={filtered}
          onEdit={(acc) => {
            setEditData(acc);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* 🧾 Modal */}
      <AccountModal
        open={open}
        handleClose={() => setOpen(false)}
        refresh={fetchAccounts}
        editData={editData}
      />

      {/* 🔔 Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
          {message}
        </div>
      )}
    </div>
  );
}