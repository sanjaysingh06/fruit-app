import { useEffect, useState } from "react";
import API from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    sales: 0,
    purchase: 0,
    outstanding: 0,
    cash: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      // 👉 You can create this API in backend
      const res = await API.get("/api/dashboard-summary/");

      setSummary(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 📊 CHART DATA
  // ===============================
  const barData = [
    { name: "Sales", value: summary.sales },
    { name: "Purchase", value: summary.purchase },
  ];

  const pieData = [
    { name: "Receivable", value: Math.max(summary.outstanding, 0) },
    { name: "Payable", value: Math.abs(Math.min(summary.outstanding, 0)) },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="flex flex-col gap-4">

      {/* 🔷 TITLE */}
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* 🔷 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Sales</p>
          <h2 className="text-xl font-bold mt-2 text-green-600">
            ₹{summary.sales}
          </h2>
        </div>

        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Purchase</p>
          <h2 className="text-xl font-bold mt-2 text-blue-600">
            ₹{summary.purchase}
          </h2>
        </div>

        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Outstanding</p>
          <h2 className="text-xl font-bold mt-2 text-red-500">
            ₹{summary.outstanding}
          </h2>
        </div>

        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Cash / Bank</p>
          <h2 className="text-xl font-bold mt-2 text-purple-600">
            ₹{summary.cash}
          </h2>
        </div>

      </div>

      {/* 🔷 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 📊 BAR CHART */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h3 className="font-semibold mb-2">Sales vs Purchase</h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🥧 PIE CHART */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h3 className="font-semibold mb-2">Outstanding Split</h3>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 🔄 LOADING */}
      {loading && (
        <div className="text-center text-gray-500">Loading...</div>
      )}
    </div>
  );
}