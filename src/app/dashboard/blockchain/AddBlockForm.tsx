"use client";

import { useState } from "react";

export default function AddBlockForm({ onSuccess }: any) {
  const [form, setForm] = useState({
    beneficiary_id: "",
    utp_number: "",
    transaction_id: "",
    amount: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/blockchain", {
        method: "POST",
        body: JSON.stringify({
          transactions: [
            {
              beneficiary_id: form.beneficiary_id,
              utp_number: form.utp_number,
              transaction_id: form.transaction_id,
              amount: Number(form.amount)
            }
          ]
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("Block added successfully!");
        onSuccess();
      } else {
        setMessage("Error: " + data.message);
      }
    } catch {
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg bg-gray-900 text-white space-y-4"
    >
      <h2 className="text-xl font-semibold">Add New Block</h2>

      {["beneficiary_id", "utp_number", "transaction_id", "amount"].map((field) => (
        <input
          key={field}
          type={field === "amount" ? "number" : "text"}
          placeholder={field.replace("_", " ").toUpperCase()}
          value={form[field as keyof typeof form]}
          onChange={(e) =>
            setForm({ ...form, [field]: e.target.value })
          }
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
      ))}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded bg-green-600 text-white w-full"
      >
        {loading ? "Adding..." : "Add Block"}
      </button>

      {message && <p className="text-yellow-400">{message}</p>}
    </form>
  );
}
