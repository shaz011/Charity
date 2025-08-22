import React from "react";
import { ItemConsumed } from "../utils/types";

interface ItemConsumedListProps {
  consumedItems: ItemConsumed[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ItemConsumedList({ consumedItems, onEdit, onDelete }: ItemConsumedListProps): JSX.Element {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceTypeLabel = (sourceType: string) => {
    return sourceType === "general_expense" ? "General Expense" : "Custom Item";
  };

  if (consumedItems.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
      }}>
        <div style={{ fontSize: "18px", color: "#6c757d", marginBottom: "8px" }}>
          📝 No items consumed yet
        </div>
        <div style={{ color: "#6c757d" }}>
          Start recording item consumption to track your inventory usage
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #e9ecef",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8f9fa" }}>
          <tr>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Item Name
            </th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Quantity
            </th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Unit
            </th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Weight (kg)
            </th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Date
            </th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Source
            </th>
            <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "14px", fontWeight: "600" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {consumedItems.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
              <td style={{ padding: "12px", fontWeight: "500", color: "#2c5aa0" }}>
                {item.itemName}
              </td>
              <td style={{ padding: "12px", color: "#333", fontWeight: "500" }}>
                {item.quantity}
              </td>
              <td style={{ padding: "12px", color: "#666" }}>
                {item.unit}
              </td>
              <td style={{ padding: "12px", color: "#666" }}>
                {item.weight ? `${item.weight} kg` : "-"}
              </td>
              <td style={{ padding: "12px", color: "#666" }}>
                {formatDate(item.consumptionDate)}
              </td>
              <td style={{ padding: "12px", color: "#666" }}>
                <span style={{
                  background: item.sourceType === "general_expense" ? "#e3f2fd" : "#f3e5f5",
                  color: item.sourceType === "general_expense" ? "#1976d2" : "#7b1fa2",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {getSourceTypeLabel(item.sourceType)}
                </span>
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ display: "flex", gap: "8", justifyContent: "center" }}>
                  <button
                    onClick={() => onEdit(item.id)}
                    style={{
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#0056b3"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#007bff"}
                    title="Edit consumption record"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#c82333"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#dc3545"}
                    title="Delete consumption record"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
