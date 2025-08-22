import React from "react";
import { Sale, Product } from "../utils/types";

interface SaleListProps {
  sales: Sale[];
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SaleList({ sales, products, onEdit, onDelete }: SaleListProps): JSX.Element {
  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f7f7f7" }}>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Product</th>
            <th style={{ textAlign: "left", padding: 8 }}>Sale Date</th>
            <th style={{ textAlign: "right", padding: 8 }}>Charity Amount</th>
            <th style={{ textAlign: "right", padding: 8 }}>Weight Before (kg)</th>
            <th style={{ textAlign: "right", padding: 8 }}>Weight After (kg)</th>
            <th style={{ textAlign: "right", padding: 8 }}>Weight Sold (kg)</th>
            <th style={{ textAlign: "right", padding: 8 }}>Price/kg</th>
            <th style={{ textAlign: "right", padding: 8 }}>Expected</th>
            <th style={{ textAlign: "right", padding: 8 }}>Received</th>
            <th style={{ textAlign: "right", padding: 8 }}>Topup</th>
            <th style={{ textAlign: "right", padding: 8 }}>Credit</th>
            <th style={{ textAlign: "right", padding: 8 }}>Arrears</th>
            <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
                          <td colSpan={14} style={{ padding: 12, textAlign: "center", color: "#666" }}>
              No sales recorded yet
            </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.id}>
                <td style={{ padding: 8 }}>{getProductName(sale.productId)}</td>
                <td style={{ padding: 8 }}>{sale.saleDate}</td>
                <td style={{ padding: 8, textAlign: "right", color: (sale.charity || 0) > 0 ? "#2c5aa0" : "#666" }}>
                  ${(sale.charity || 0).toFixed(2)}
                </td>
                <td style={{ padding: 8, textAlign: "right", color: "#0066cc" }}>{(sale.weightBeforeSale || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right", color: "#666" }}>{(sale.weightAfterSale || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right", fontWeight: "bold" }}>{(sale.weight || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>${(sale.pricePerKg || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>${(sale.expectedCash || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>${(sale.receivedCash || 0).toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right", color: (sale.topup || 0) > 0 ? "#2c5aa0" : "#666" }}>
                  ${(sale.topup || 0).toFixed(2)}
                </td>
                <td style={{ padding: 8, textAlign: "right", color: (sale.credit || 0) > 0 ? "#2c5aa0" : "#666" }}>
                  ${(sale.credit || 0).toFixed(2)}
                </td>
                <td style={{ padding: 8, textAlign: "right", color: (sale.arrears || 0) > 0 ? "#d32f2f" : "#388e3c" }}>
                  ${(sale.arrears || 0).toFixed(2)}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <button onClick={() => onEdit(sale.id)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => onDelete(sale.id)} aria-label={`Delete sale`}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
