import React, { useState } from "react";
import { ItemConsumedForm } from "./ItemConsumedForm";
import { ItemConsumedList } from "./ItemConsumedList";
import { ItemConsumed, ItemConsumedInput, GeneralExpense, CustomItem } from "../utils/types";

interface ItemConsumedPageProps {
  consumedItems: ItemConsumed[];
  generalExpenses: GeneralExpense[];
  customItems: CustomItem[];
  onCreateConsumedItem: (data: ItemConsumedInput) => void;
  onUpdateConsumedItem: (id: string, data: ItemConsumedInput) => void;
  onDeleteConsumedItem: (id: string) => void;
}

export function ItemConsumedPage({ 
  consumedItems, 
  generalExpenses, 
  customItems,
  onCreateConsumedItem, 
  onUpdateConsumedItem, 
  onDeleteConsumedItem 
}: ItemConsumedPageProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [editingConsumedItem, setEditingConsumedItem] = useState<ItemConsumed | undefined>();

  const handleSubmit = (data: ItemConsumedInput) => {
    if (editingConsumedItem) {
      onUpdateConsumedItem(editingConsumedItem.id, data);
      setEditingConsumedItem(undefined);
    } else {
      onCreateConsumedItem(data);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingConsumedItem(undefined);
  };

  const handleEdit = (id: string) => {
    const consumedItem = consumedItems.find(item => item.id === id);
    if (consumedItem) {
      setEditingConsumedItem(consumedItem);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this consumption record?")) {
      onDeleteConsumedItem(id);
    }
  };

  // Get today's consumption summary
  const today = new Date().toISOString().slice(0, 10);
  const todayConsumption = consumedItems.filter(item => item.consumptionDate === today);
  const totalItemsToday = todayConsumption.length;
  const totalQuantityToday = todayConsumption.reduce((sum, item) => sum + item.quantity, 0);
  const totalCostToday = todayConsumption.reduce((sum, item) => {
    const itemCost = (item.price || 0) * item.quantity;
    return sum + itemCost;
  }, 0);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#2c5aa0" }}>Item Consumption Tracking</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#4caf50",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#45a049";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#4caf50";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            ➕ Record New Consumption
          </button>
        )}
      </div>

      {/* Today's Summary */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📅 Today
          </div>
          <div style={{ fontSize: "18px" }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            🍽️ Items Consumed
          </div>
          <div style={{ fontSize: "18px" }}>
            {totalItemsToday} items
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📊 Total Quantity
          </div>
          <div style={{ fontSize: "18px" }}>
            {totalQuantityToday.toFixed(2)} units
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📈 Total Records
          </div>
          <div style={{ fontSize: "18px" }}>
            {consumedItems.length} records
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            💰 Today's Cost
          </div>
          <div style={{ fontSize: "18px" }}>
            ${totalCostToday.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div style={{ 
          marginBottom: 24, 
          padding: "20px", 
          background: "#f8f9fa", 
          borderRadius: "8px", 
          border: "1px solid #e9ecef" 
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "16px" 
          }}>
            <h4 style={{ margin: 0, color: "#2c5aa0" }}>
              {editingConsumedItem ? "Edit Consumption Record" : "Record New Item Consumption"}
            </h4>
            <button
              onClick={handleCancel}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕ Cancel
            </button>
          </div>
          <ItemConsumedForm
            consumedItem={editingConsumedItem}
            generalExpenses={generalExpenses}
            customItems={customItems}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* List Section */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#2c5aa0" }}>
          Consumption History
        </h3>
        <ItemConsumedList
          consumedItems={consumedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Help Section */}
      <div style={{
        background: "#e3f2fd",
        border: "1px solid #bbdefb",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "24px"
      }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#1976d2" }}>
          💡 How to use this page
        </h4>
        <div style={{ color: "#1976d2", fontSize: "14px", lineHeight: "1.5" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Record Consumption:</strong> Click "Record New Consumption" to track items consumed today
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Select Source:</strong> Choose between General Expenses or Custom Items as the source
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Auto-population:</strong> Selecting an item automatically sets the unit, price, and source ID
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Track Usage:</strong> Monitor daily consumption patterns and inventory usage
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Cost Tracking:</strong> View item prices and calculate daily consumption costs
          </p>
        </div>
      </div>
    </div>
  );
}
