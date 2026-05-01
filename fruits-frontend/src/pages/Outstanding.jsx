import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Outstanding() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/all-outstanding/");
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 FILTER
  const filtered = data.filter((row) => {
    const matchSearch = row.account_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchType =
      typeFilter === "RECEIVABLE"
        ? row.balance > 0
        : typeFilter === "PAYABLE"
        ? row.balance < 0
        : true;

    const matchAmount = minAmount
      ? Math.abs(row.balance) >= Number(minAmount)
      : true;

    return matchSearch && matchType && matchAmount;
  });

  // 📊 SUMMARY
  const totalReceivable = filtered
    .filter((d) => d.balance > 0)
    .reduce((sum, d) => sum + d.balance, 0);

  const totalPayable = filtered
    .filter((d) => d.balance < 0)
    .reduce((sum, d) => sum + d.balance, 0);

  // 🔁 RESET
  const handleReset = () => {
    setSearch("");
    setTypeFilter("");
    setMinAmount("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">

      {/* 🔷 HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-3 shrink-0">
        <div className="flex justify-between mb-3">
          <h2 className="text-2xl font-bold">Outstanding</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search account..."
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
            <option value="RECEIVABLE">Receivable</option>
            <option value="PAYABLE">Payable</option>
          </select>

          <input
            type="number"
            placeholder="Min Amount"
            className="border px-3 py-2 rounded w-full md:w-40"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />

          <button
            onClick={handleReset}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 🔄 CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow p-4">

        {/* 📊 SUMMARY */}
        <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <div className="text-sm text-gray-600">Receivable</div>
            <div className="text-lg font-bold text-green-600">
              ₹{totalReceivable}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <div className="text-sm text-gray-600">Payable</div>
            <div className="text-lg font-bold text-red-600">
              ₹{totalPayable}
            </div>
          </div>
        </div>

        {/* 🔄 LOADING */}
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">

            {/* 💻 DESKTOP TABLE */}
            <div className="hidden md:block flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Account</th>
                    <th className="p-3 text-left">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.account_id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate("/ledger", {
                          state: { account_id: row.account_id },
                        })
                      }
                    >
                      <td className="p-3">{row.account_name}</td>
                      <td
                        className={`p-3 font-semibold ${
                          row.balance > 0
                            ? "text-green-600"
                            : row.balance < 0
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        ₹{row.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 MOBILE LIST */}
            <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-20">
              {filtered.map((row) => (
                <div
                  key={row.account_id}
                  className="border p-3 rounded-lg shadow-sm cursor-pointer"
                  onClick={() =>
                    navigate("/ledger", {
                      state: { account_id: row.account_id },
                    })
                  }
                >
                  <div className="font-semibold">
                    {row.account_name}
                  </div>

                  <div
                    className={`mt-1 font-bold ${
                      row.balance > 0
                        ? "text-green-600"
                        : row.balance < 0
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    ₹{row.balance}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}