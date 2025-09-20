import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

export default function SchoolTransactions(){
  const [transactions, setTransactions] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  useEffect(()=> {
    API.get("/transactions").then(res => setTransactions(res.data)).catch(console.error);
  }, []);
  const schools = useMemo(() => {
    const s = new Set();
    transactions.forEach(t => {
      const school = (t.order_info?.school_id) ?? t.school_id;
      if (school) s.add(school);
    });
    return Array.from(s);
  }, [transactions]);

  const filtered = transactions.filter(t => {
    const school = (t.order_info?.school_id) ?? t.school_id;
    if (!selectedSchool) return true;
    return school === selectedSchool;
  });

  useEffect(() => {
    if (schoolId) setSelectedSchool(schoolId);
  }, [schoolId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <main className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Transactions by School</h2>

        <div className="mb-4">
          <label className="block mb-2">Select School</label>
          <select value={schoolId} onChange={(e)=>setSchoolId(e.target.value)} className="p-2 border rounded bg-white dark:bg-slate-700">
            <option value="">-- All Schools --</option>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Collect ID</th>
                <th className="py-2">Student</th>
                <th className="py-2">Order Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="py-6 text-center">No transactions</td></tr>
              ) : filtered.map(t => {
                const order = t.order_info ?? {};
                return (
                  <tr key={t._id ?? t.collect_id} className="border-t">
                    <td className="py-2">{t.collect_id ?? t._id}</td>
                    <td className="py-2">{order.student_info?.name ?? "-"}</td>
                    <td className="py-2">{t.order_amount}</td>
                    <td className="py-2">{t.status}</td>
                    <td className="py-2">{t.payment_time ? new Date(t.payment_time).toLocaleString() : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
