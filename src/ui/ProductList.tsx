import React from "react";
import { Product } from "../utils/types";

interface ProductListProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps): JSX.Element {
  return (
    <div style={{ 
      border: "1px solid #e9ecef", 
      borderRadius: 12, 
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
          <tr>
            <th style={{ 
              textAlign: "left", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Product</th>
            <th style={{ 
              textAlign: "left", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Unit</th>
            <th style={{ 
              textAlign: "right", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Sale Price</th>
            <th style={{ 
              textAlign: "right", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Quantity</th>
            <th style={{ 
              textAlign: "left", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Sale Date</th>
            <th style={{ 
              textAlign: "right", 
              padding: "16px 12px", 
              fontWeight: "600",
              color: "#495057",
              borderBottom: "2px solid #dee2e6"
            }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#666" }}>
                <div style={{ fontSize: "16px", marginBottom: "8px" }}>📦 No products yet</div>
                <div style={{ fontSize: "14px", color: "#999" }}>Click "Add New Product" to get started</div>
              </td>
            </tr>
          ) : (
            products.map((p, index) => (
              <tr key={p.id} style={{ 
                background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                transition: "background-color 0.2s ease"
              }}>
                <td style={{ padding: "12px", fontWeight: "500", color: "#212529" }}>{p.name}</td>
                <td style={{ padding: "12px", color: "#6c757d" }}>{p.unit}</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#28a745" }}>${p.salePrice?.toFixed(2) || "0.00"}</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "#495057" }}>{p.quantity ?? 0}</td>
                <td style={{ padding: "12px", color: "#6c757d" }}>{p.buyingDate}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <button 
                    onClick={() => onEdit(p.id)} 
                    style={{ 
                      marginRight: 8,
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
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => onDelete(p.id)} 
                    aria-label={`Delete ${p.name}`}
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
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}



