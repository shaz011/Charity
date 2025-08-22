import React, { useMemo, useState } from "react";
import { SaleForm } from "./SaleForm";
import { SaleList } from "./SaleList";
import { SaleInput, Sale, Product } from "../utils/types";

interface SalesPageProps {
  products: Product[];
  sales: Sale[];
  createSale: (input: SaleInput) => Promise<void>;
  updateSale: (id: string, input: SaleInput) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function SalesPage({ 
  products, 
  sales, 
  createSale, 
  updateSale, 
  deleteSale, 
  loading, 
  error, 
  clearError 
}: SalesPageProps): JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingSale = useMemo(() => sales.find((s) => s.id === editingId) || null, [sales, editingId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div>Loading sales...</div>
      </div>
    );
  }

  const sortedSales = useMemo(() => [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [sales]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {error && (
        <div style={{ 
          gridColumn: "1 / -1", 
          background: "#ffebee", 
          color: "#c62828", 
          padding: "12px", 
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>Error: {error}</span>
          <button onClick={clearError} style={{ background: "none", border: "none", color: "#c62828", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      <div>
        <h2 style={{ margin: "8px 0" }}>Record Sale</h2>
        <SaleForm
          key={editingSale?.id || "new"}
          products={products}
          sale={editingSale || undefined}
          onCancel={() => setEditingId(null)}
          onSubmit={async (data) => {
            try {
              if (editingSale) {
                await updateSale(editingSale.id, data);
                setEditingId(null);
              } else {
                await createSale(data);
              }
            } catch (err) {
              // Error is handled by the parent component
            }
          }}
        />
      </div>
      <div>
        <h2 style={{ margin: "8px 0" }}>Sales History</h2>
        <SaleList
          sales={sortedSales}
          products={products}
          onEdit={(id) => setEditingId(id)}
          onDelete={async (id) => {
            try {
              await deleteSale(id);
              if (editingId === id) setEditingId(null);
            } catch (err) {
              // Error is handled by the parent component
            }
          }}
        />
      </div>
    </div>
  );
}
