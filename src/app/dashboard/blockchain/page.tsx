"use client";

import { useEffect, useState } from "react";
import ChainView from "./ChainView";
import AddBlockForm from "./AddBlockForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function BlockchainDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [chain, setChain] = useState([]);
  const [message, setMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Redirect if user is not officer
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "officer") {
        router.replace("/unauthorized"); // create an Unauthorized page
      }
    }
  }, [loading, profile]);

  const fetchChain = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/blockchain");
      const data = await res.json();
      setChain(data.chain || []);
      setMessage(data.message);
    } catch (err) {
      setMessage("Failed to fetch blockchain");
    } finally {
      setFetchLoading(false);
    }
  };

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Blockchain Dashboard</h1>

      <button
        onClick={fetchChain}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Refresh Chain
      </button>

      {fetchLoading && <div className="text-gray-400">Loading...</div>}
      {message && <div className="text-green-500">{message}</div>}

      <AddBlockForm onSuccess={fetchChain} />

      <ChainView chain={chain} />
    </div>
  );
}
