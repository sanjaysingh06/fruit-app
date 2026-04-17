export default function AccountTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Opening</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((acc) => (
              <tr key={acc.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{acc.name}</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                    {acc.role}
                  </span>
                </td>
                <td className="p-3">₹{acc.opening_balance}</td>
                <td className="p-3">{acc.phone || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => onEdit(acc)}
                    className="text-blue-500 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(acc.id)}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((acc) => (
          <div
            key={acc.id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <div className="font-semibold text-lg">{acc.name}</div>

            <div className="text-sm text-gray-500 mt-1">
              {acc.role}
            </div>

            <div className="mt-2 text-sm">
              <span className="font-medium">Balance:</span> ₹{acc.opening_balance}
            </div>

            <div className="text-sm">
              <span className="font-medium">Phone:</span> {acc.phone || "-"}
            </div>

            <div className="flex gap-4 mt-3">
              <button
                onClick={() => onEdit(acc)}
                className="text-blue-500"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(acc.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          No accounts found
        </div>
      )}
    </div>
  );
}