"use client";

import { useState } from "react";

export default function BlockCard({ block, index }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-gray-800 text-white">
      <div
        className="cursor-pointer flex justify-between"
        onClick={() => setOpen(!open)}
      >
        <h3 className="font-semibold">Block #{index}</h3>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <p><strong>Hash:</strong> {block.hash}</p>
          <p><strong>Previous Hash:</strong> {block.previousHash}</p>
          <p><strong>Merkle Root:</strong> {block.merkleRoot}</p>
          <p><strong>Timestamp:</strong> {block.timestamp}</p>
          <p><strong>Beneficiary ID:</strong> {block.beneficiary_id}</p>
          <p><strong>UTP Number:</strong> {block.utp_number}</p>
          <p><strong>Transaction ID:</strong> {block.transaction_id}</p>
          <p><strong>Amount:</strong> {block.amount}</p>
          <p><strong>Nonce:</strong> {block.nonce}</p>
        </div>
      )}
    </div>
  );
}
