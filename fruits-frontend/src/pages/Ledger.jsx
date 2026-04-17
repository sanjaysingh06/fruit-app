import { useEffect, useState } from "react";
import API from "../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");

  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ===============================
  // 🔄 LOAD ACCOUNTS
  // ===============================
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await API.get("/api/accounts/");
      setAccounts(res.data);
    } catch {
      setMessage("Failed to load accounts");
    }
  };

  // ===============================
  // 🔄 LOAD LEDGER (SAFE)
  // ===============================
  const fetchLedger = async () => {
    if (!selectedAccount) return;

    try {
      setLoading(true);

      let url = `/api/ledger/${selectedAccount}/?`;

      if (fromDate) url += `from_date=${fromDate}&`;
      if (toDate) url += `to_date=${toDate}&`;
      if (type) url += `type=${type}&`;

      const res = await API.get(url);
      setLedger(res.data);

      const sumRes = await API.get(`/api/summary/${selectedAccount}/`);
      setSummary(sumRes.data);

    } catch (error) {
      console.log("Ledger error:", error);
      setMessage("Error loading ledger");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Only call when account exists
  useEffect(() => {
    if (selectedAccount) {
      fetchLedger();
    }
  }, [selectedAccount, fromDate, toDate, type]);

  // ===============================
  // 🔁 RESET
  // ===============================
  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setType("");
  };

  const openingBalance = ledger.length > 0 ? ledger[0].balance : 0;

  // ===============================
  // 📄 PDF
  // ===============================
  const handlePrint = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text("SHUBHAM FRUITS COMPANY", pageWidth / 2, 15, { align: "center" });

    doc.text(`Party: ${selectedAccountName}`, 14, 30);

    const tableData = ledger.map((row) => [
      row.date,
      row.transaction_type,
      row.reference,
      row.debit || "",
      row.credit || "",
      row.balance,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Type", "Ref", "Debit", "Credit", "Balance"]],
      body: tableData,
    });

    doc.save(`${selectedAccountName}_ledger.pdf`);
  };

  // ===============================
  // 📊 EXCEL
  // ===============================
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(ledger);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `${selectedAccountName}_ledger.xlsx`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">

      {/* 🔷 HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-3 shrink-0">

        {/* Row 1 */}
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl font-bold">Ledger</h2>
        </div>

        {/* Row 2 Filters */}
        <div className="flex flex-col md:flex-row gap-2">

          <select
            className="border px-3 py-2 rounded w-full md:w-64"
            value={selectedAccount}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedAccount(id);
              const acc = accounts.find((a) => a.id == id);
              setSelectedAccountName(acc?.name || "");
            }}
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            <option value="SALE">Sale</option>
            <option value="PURCHASE">Purchase</option>
            <option value="PAYMENT">Payment</option>
            <option value="RECEIPT">Receipt</option>
          </select>

          <button
            onClick={handleReset}
            className="border px-4 py-2 rounded hover:bg-gray-100"
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
          <>
            {/* SUMMARY */}
            {selectedAccount && summary && (
              <div className="mb-3 border p-3 rounded">
                <div className="font-semibold">{selectedAccountName}</div>

                <div className="flex justify-between mt-2 text-sm">
                  <div>Opening: ₹{openingBalance}</div>
                  <div className={summary.balance >= 0 ? "text-green-600" : "text-red-500"}>
                    Closing: ₹{summary.balance}
                  </div>
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handlePrint}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Print PDF
              </button>

              <button
                onClick={handleExportExcel}
                className="border px-4 py-2 rounded"
              >
                Export Excel
              </button>
            </div>

            {/* TABLE */}
            <div className="hidden md:block h-full overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Ref</th>
                    <th className="p-2 text-left">Debit</th>
                    <th className="p-2 text-left">Credit</th>
                    <th className="p-2 text-left">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {ledger.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">{row.transaction_type}</td>
                      <td className="p-2">{row.reference}</td>
                      <td className="p-2 text-red-500">{row.debit || "-"}</td>
                      <td className="p-2 text-green-600">{row.credit || "-"}</td>
                      <td className="p-2 font-semibold">₹{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-2 overflow-y-auto">
              {ledger.map((row, i) => (
                <div key={i} className="border p-3 rounded">
                  <div className="font-semibold">{row.date}</div>
                  <div>Type: {row.transaction_type}</div>
                  <div>Ref: {row.reference}</div>
                  <div className="text-red-500">Debit: {row.debit || "-"}</div>
                  <div className="text-green-600">Credit: {row.credit || "-"}</div>
                  <div className="font-bold">Balance: ₹{row.balance}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded">
          {message}
        </div>
      )}
    </div>
  );
}