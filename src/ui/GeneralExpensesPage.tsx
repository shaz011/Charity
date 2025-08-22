import React, { useState } from "react";
import { GeneralExpenseForm } from "./GeneralExpenseForm";
import { GeneralExpenseList } from "./GeneralExpenseList";
import { CustomItemManager } from "./CustomItemManager";
import { GeneralExpense, GeneralExpenseInput, CustomItem, CustomItemInput } from "../utils/types";

interface GeneralExpensesPageProps {
  expenses: GeneralExpense[];
  customItems: CustomItem[];
  onCreateExpense: (data: GeneralExpenseInput) => void;
  onUpdateExpense: (id: string, data: GeneralExpenseInput) => void;
  onDeleteExpense: (id: string) => void;
  onCreateCustomItem: (data: CustomItemInput) => void;
  onUpdateCustomItem: (id: string, data: CustomItemInput) => void;
  onDeleteCustomItem: (id: string) => void;
}

export function GeneralExpensesPage({ 
  expenses, 
  customItems,
  onCreateExpense, 
  onUpdateExpense, 
  onDeleteExpense,
  onCreateCustomItem,
  onUpdateCustomItem,
  onDeleteCustomItem
}: GeneralExpensesPageProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GeneralExpense | undefined>();
  const [showCustomItemManager, setShowCustomItemManager] = useState(false);

  const handleSubmit = (data: GeneralExpenseInput) => {
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, data);
      setEditingExpense(undefined);
    } else {
      onCreateExpense(data);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  const handleEdit = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingExpense(expense);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      onDeleteExpense(id);
    }
  };

  const handleManageCustomItems = () => {
    setShowCustomItemManager(true);
  };

  const handleCloseCustomItemManager = () => {
    setShowCustomItemManager(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#2c5aa0" }}>General Expenses Management</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleManageCustomItems}
            style={{
              background: "#2196f3",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Manage Items
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#4caf50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Add New Expense
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ marginBottom: 24 }}>
          <GeneralExpenseForm
            expense={editingExpense}
            customItems={customItems}
            onManageCustomItems={handleManageCustomItems}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <GeneralExpenseList
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showCustomItemManager && (
        <CustomItemManager
          customItems={customItems}
          onAddItem={onCreateCustomItem}
          onUpdateItem={onUpdateCustomItem}
          onDeleteItem={onDeleteCustomItem}
          onClose={handleCloseCustomItemManager}
        />
      )}
    </div>
  );
}
