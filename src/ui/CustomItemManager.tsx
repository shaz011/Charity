import React, { useState } from "react";
import { CustomItem, CustomItemInput } from "../utils/types";

interface CustomItemManagerProps {
  customItems: CustomItem[];
  onAddItem: (item: CustomItemInput) => void;
  onUpdateItem: (id: string, item: CustomItemInput) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
}

export function CustomItemManager({ 
  customItems, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem, 
  onClose 
}: CustomItemManagerProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | undefined>();
  const [formData, setFormData] = useState<CustomItemInput>({
    name: "",
    unit: "kg"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdateItem(editingItem.id, formData);
      setEditingItem(undefined);
    } else {
      onAddItem(formData);
    }
    
    setFormData({ name: "", unit: "kg" });
    setShowForm(false);
  };

  const handleEdit = (item: CustomItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, unit: item.unit });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this custom item?")) {
      onDeleteItem(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
    setFormData({ name: "", unit: "kg" });
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: "rgba(0,0,0,0.5)", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{ 
        background: "white", 
        padding: 24, 
        borderRadius: 8, 
        maxWidth: 600, 
        width: "90%", 
        maxHeight: "80vh", 
        overflow: "auto" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: "#2c5aa0" }}>Manage Custom Items</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "24px", 
              cursor: "pointer", 
              color: "#666" 
            }}
          >
            ×
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2c5aa0" }}>
              {editingItem ? "Edit Custom Item" : "Add New Custom Item"}
            </h3>
            
            <div style={{ display: "grid", gap: 16 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Item Name *</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                  style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span>Unit *</span>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as any }))}
                  style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pack">Pack</option>
                  <option value="piece">Piece</option>
                  <option value="liter">Liter</option>
                  <option value="dozen">Dozen</option>
                  <option value="gram">Gram</option>
                  <option value="bottle">Bottle</option>
                  <option value="packet">Packet</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  type="submit" 
                  style={{ 
                    background: "#4caf50", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 16px", 
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  style={{ 
                    background: "#f44336", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 16px", 
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ 
              background: "#4caf50", 
              color: "white", 
              border: "none", 
              padding: "12px 24px", 
              borderRadius: 4, 
              cursor: "pointer",
              marginBottom: 20
            }}
          >
            Add New Custom Item
          </button>
        )}

        <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: "#f7f7f7", padding: 16, borderBottom: "1px solid #ddd" }}>
            <h3 style={{ margin: 0, color: "#2c5aa0" }}>Custom Items ({customItems.length})</h3>
          </div>

          {customItems.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
              No custom items added yet. Add your first custom item above.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f7f7f7" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Item Name</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Unit</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: 8, fontWeight: "bold" }}>{item.name}</td>
                    <td style={{ padding: 8 }}>{item.unit}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      <button 
                        onClick={() => handleEdit(item)} 
                        style={{ 
                          marginRight: 8, 
                          background: "#2196f3", 
                          color: "white", 
                          border: "none", 
                          padding: "4px 8px", 
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        style={{ 
                          background: "#f44336", 
                          color: "white", 
                          border: "none", 
                          padding: "4px 8px", 
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button 
            onClick={onClose}
            style={{ 
              background: "#666", 
              color: "white", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
