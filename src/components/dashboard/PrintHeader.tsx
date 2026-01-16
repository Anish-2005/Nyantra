import React from "react";

interface PrintHeaderProps {
  title: string;
  date?: Date;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ title, date }) => (
  <div className="print-only hidden">
    <div
      style={{
        textAlign: "center",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "2px solid #3b82f6",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#0f172a",
          marginBottom: "8px",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: "14px", color: "#64748b" }}>
        Generated on{" "}
        {(date || new Date()).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  </div>
);

export default PrintHeader;
