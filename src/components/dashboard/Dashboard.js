import React, { useEffect, useMemo, useState, useRef } from "react";
import API from "../../api";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const DEFAULT_PAGE_SIZE = 10;

export default function Dashboard() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

  // URL → state
  const urlStatus = searchParams.get("status") || "";
  const urlSchool = searchParams.get("school") || "";
  const urlQ = searchParams.get("q") || "";
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlPageSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);
  const urlSort = searchParams.get("sort") || "payment_time:desc";

  const [selectedStatus, setSelectedStatus] = useState(urlStatus);
  const [selectedSchool, setSelectedSchool] = useState(urlSchool);
  const [searchText, setSearchText] = useState(urlQ);
  const [fromDate, setFromDate] = useState(urlFrom);
  const [toDate, setToDate] = useState(urlTo);
  const [page, setPage] = useState(urlPage || 1);
  const [pageSize, setPageSize] = useState(urlPageSize || DEFAULT_PAGE_SIZE);
  const [sortSpec, setSortSpec] = useState(urlSort);

  const searchRef = useRef(null);

  // Sync state → URL
  useEffect(() => {
    const params = {};
    if (selectedStatus) params.status = selectedStatus;
    if (selectedSchool) params.school = selectedSchool;
    if (searchText) params.q = searchText;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    if (page > 1) params.page = String(page);
    if (pageSize !== DEFAULT_PAGE_SIZE) params.pageSize = String(pageSize);
    if (sortSpec) params.sort = sortSpec;
    setSearchParams(params);
  }, [selectedStatus, selectedSchool, searchText, fromDate, toDate, page, pageSize, sortSpec, setSearchParams]);

  // Fetch data
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await API.get("/transactions");
        console.log(">>> RAW API RESPONSE:", res.data);   // 👈 debug
        setRaw(res.data || []);
      } catch (err) {
        console.error("Fetch transactions failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);


  // Normalize
  const normalized = useMemo(() => {
    return raw.map((item) => {
      const order = item.order_info || {};

      return {
        id: item._id,
        collect_id: item.collect_id,
        customer_order_id: item.customer_order_id || "-",  
        school_id: order.school_id || "-",
        student_name: order.student_info?.name || "-",
        gateway: order.gateway_name || "-",
        order_amount: item.order_amount ?? "-",
        transaction_amount: item.transaction_amount ?? "-",
        status: item.status || "unknown",
        payment_time: item.payment_time || item.createdAt || null,
      };
    });
  }, [raw]);

  // Processed list
  const processed = useMemo(() => {
    let arr = [...normalized];
    if (selectedStatus) arr = arr.filter((r) => r.status === selectedStatus);
    if (selectedSchool) arr = arr.filter((r) => r.school_id === selectedSchool);
    if (fromDate) {
      const f = new Date(fromDate);
      f.setHours(0, 0, 0, 0); // start of day in IST
      arr = arr.filter((r) => {
        if (!r.payment_time) return false;
        const paymentDate = new Date(r.payment_time);
        // convert to IST
        const istDate = new Date(paymentDate.getTime() + (5.5 * 60 * 60 * 1000));
        return istDate >= f;
      });
    }
    if (toDate) {
      const t = new Date(toDate);
      t.setHours(23, 59, 59, 999); // end of day in IST
      arr = arr.filter((r) => {
        if (!r.payment_time) return false;
        const paymentDate = new Date(r.payment_time);
        // convert to IST
        const istDate = new Date(paymentDate.getTime() + (5.5 * 60 * 60 * 1000));
        return istDate <= t;
      });
    }
    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          (r.collect_id && r.collect_id.toString().toLowerCase().includes(q)) ||
          (r.school_id && r.school_id.toLowerCase().includes(q)) ||
          (r.customer_order_id && r.customer_order_id.toString().toLowerCase().includes(q)) ||
          (r.student_name && r.student_name.toLowerCase().includes(q))
      );
    }

    // Sorting
    const [field, order] = (sortSpec || "payment_time:desc").split(":");
    arr.sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (field === "payment_time") {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        return order === "asc" ? da - db : db - da;
      }
      if (typeof va === "number" && typeof vb === "number") {
        return order === "asc" ? va - vb : vb - va;
      }
      const sa = (va ?? "").toString().toLowerCase();
      const sb = (vb ?? "").toString().toLowerCase();
      if (sa < sb) return order === "asc" ? -1 : 1;
      if (sa > sb) return order === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [normalized, selectedStatus, selectedSchool, searchText, fromDate, toDate, sortSpec]);

  // Pagination
  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processed.slice(start, start + pageSize);
  }, [processed, page, pageSize]);

  const changeSort = (field) => {
    const [curField, curOrder] = (sortSpec || "payment_time:desc").split(":");
    let next = "desc";
    if (curField === field) next = curOrder === "asc" ? "desc" : "asc";
    setSortSpec(`${field}:${next}`);
  };

  const getSortIndicator = (field) => {
    const [curField, curOrder] = sortSpec.split(":");
    if (curField !== field) return "";
    return curOrder === "asc" ? "↑" : "↓";
  };

  const exportCSV = () => {
    const headers = [
      "Collect ID",
      "School ID",
      "Gateway",
      "Order Amount",
      "Transaction Amount",
      "Status",
      "Custom Order ID",
      "Payment Time",
      "Student",
    ];
    const rows = visible.map((r) => [
      r.collect_id,
      r.school_id,
      r.gateway,
      r.order_amount,
      r.transaction_amount,
      r.status,
      r.customer_order_id,
      r.payment_time ? new Date(r.payment_time).toLocaleString() : "",
      r.student_name,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const filename = `transaction_${fromDate || "all"}_${toDate || "all"}.csv`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-semibold">History</h2>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-500"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 flex flex-wrap gap-2">
          <input
            ref={searchRef}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student, collect id, order..."
            className="w-64 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />

          {/* Status dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* School dropdown */}
          <select
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Schools</option>
            {[...new Set(normalized.map((r) => r.school_id))].map((sid) => (
              <option key={sid} value={sid}>
                {sid}
              </option>
            ))}
          </select>

          {/* Dates */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => changeSort("collect_id")}>
                  Collect ID {getSortIndicator("collect_id")}
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => changeSort("school_id")}>
                  School ID {getSortIndicator("school_id")}
                </th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Gateway</th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => changeSort("order_amount")}>
                  Order Amount {getSortIndicator("order_amount")}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => changeSort("transaction_amount")}>
                  Transaction Amount {getSortIndicator("transaction_amount")}
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Custom Order ID</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => changeSort("payment_time")}>
                  Payment Date & Time {getSortIndicator("payment_time")}
                </th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-6 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                visible.map((r, idx) => (
                  <tr key={r.id} className="border-t hover:bg-slate-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-3">{r.collect_id}</td>
                    <td className="px-4 py-3">{r.school_id}</td>
                    <td className="px-4 py-3">{r.student_name}</td>
                    <td className="px-4 py-3">{r.gateway}</td>
                    <td className="px-4 py-3 text-right">₹{r.order_amount}</td>
                    <td className="px-4 py-3 text-right">₹{r.transaction_amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status.toLowerCase().includes("success")
                            ? "bg-green-100 text-green-700"
                            : r.status.toLowerCase().includes("pending")
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status.toLowerCase().includes("fail")
                            ? "bg-red-100 text-red-700"
                            : r.status.toLowerCase().includes("refund")
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.customer_order_id}</td>
                    <td className="px-4 py-3">
                      {r.payment_time ? new Date(r.payment_time).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (!window.confirm("Are you sure you want to delete this transaction?")) return;

                          try {
                            await API.delete(`/transactions/${r.id}`); // ✅ add ID here
                            alert("Transaction deleted successfully");
                            window.location.reload(); // refresh the table
                          } catch (err) {
                            console.error("Delete failed:", err);
                            alert("Failed to delete transaction.");
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600"
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
