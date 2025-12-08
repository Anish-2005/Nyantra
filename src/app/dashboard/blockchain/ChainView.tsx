"use client";

import BlockCard from "./BlockCard";

export default function ChainView({ chain }: { chain: any[] }) {
  if (!chain || chain.length === 0) return <div>No blocks found.</div>;

  const blocksPerRow = 4; // Adjust row length
  const rows: any[][] = [];
  for (let i = 0; i < chain.length; i += blocksPerRow) {
    rows.push(chain.slice(i, i + blocksPerRow));
  }

  return (
    <div className="flex flex-col gap-12 relative">
      {rows.map((row, rowIndex) => {
        const isReverse = rowIndex % 2 === 1;

        return (
          <div
            key={rowIndex}
            className={`flex ${isReverse ? "flex-row-reverse" : "flex-row"} gap-6 justify-center relative`}
          >
            {row.map((block, idx) => {
              const globalIndex = rowIndex * blocksPerRow + idx;
              const isLastBlock = globalIndex === chain.length - 1;
              const isRowEnd = idx === row.length - 1;

              return (
                <div key={globalIndex} className="relative flex items-center">
                  {/* Block with hover popup */}
                  <div className="group relative">
                    <BlockCard block={block} index={globalIndex} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-4 bg-gray-800 text-white border border-gray-600 rounded shadow-lg z-10">
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
                  </div>

                  {/* Horizontal arrow to next block in the same row */}
                  {!isRowEnd && (
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={isReverse ? "M24 12H0M0 12l6-6M0 12l6 6" : "M0 12H24M24 12l-6-6M24 12l-6 6"} />
                    </svg>
                  )}

                  {/* Curved arrow down to next row (only at end of row if not last row) */}
                  {isRowEnd && rowIndex < rows.length - 1 && (
                    <svg className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-6 h-12 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={isReverse ? "M12 0v18l-6-6" : "M12 0v18l6-6"} />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
