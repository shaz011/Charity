import React, { useState } from "react";
import { CustomProductInput } from "../utils/types";

interface CustomProductManagerProps {
  customProducts: CustomProductInput[];
  onAddProduct: (data: CustomProductInput) => void;
  onUpdateProduct: (id: string, data: CustomProductInput) => void;
  onDeleteProduct: (id: string) => void;
  onClose: () => void;
}

export function CustomProductManager({ 
  customProducts, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onClose 
}: CustomProductManagerProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProductInput | undefined>();
  const [formData, setFormData] = useState<CustomProductInput>({
    name: "",
    unit: "kg"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (editingProduct) {
        onUpdateProduct(editingProduct.id!, formData);
        setEditingProduct(undefined);
      } else {
        onAddProduct(formData);
      }
      setFormData({ name: "", unit: "kg" });
      setShowForm(false);
    }
  };

  const handleEdit = (product: CustomProductInput) => {
    setEditingProduct(product);
    setFormData({ name: product.name, unit: product.unit });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this custom product?")) {
      onDeleteProduct(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
    setFormData({ name: "", unit: "kg" });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{ margin: 0, color: "#2c5aa0" }}>Manage Custom Products</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
              padding: "4px"
            }}
          >
            ✕
          </button>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "20px",
              transition: "background-color 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#218838"}
            onMouseOut={(e) => e.currentTarget.style.background = "#28a745"}
          >
            ➕ Add New Custom Product
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              <label style={{ display: "grid", gap: "6" }}>
                <span style={{ fontWeight: "500", color: "#333" }}>Product Name *</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "6" }}>
                <span style={{ fontWeight: "500", color: "#333" }}>Unit *</span>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as "kg" | "pack" })}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white"
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="pack">pack</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: "12" }}>
                <button
                  type="submit"
                  style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {editingProduct ? "🔄 Update" : "✅ Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div style={{
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Product Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Unit</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                    No custom products yet
                  </td>
                </tr>
              ) : (
                customProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{product.name}</td>
                    <td style={{ padding: "12px", color: "#666" }}>{product.unit}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          marginRight: "8px"
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id!)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
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

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

