import React, { useState } from "react";
import { MiscExpenseForm } from "./MiscExpenseForm";
import { MiscExpenseList } from "./MiscExpenseList";
import { MiscExpense, MiscExpenseInput } from "../utils/types";

interface MiscExpensesPageProps {
  expenses: MiscExpense[];
  onCreateExpense: (data: MiscExpenseInput) => void;
  onUpdateExpense: (id: string, data: MiscExpenseInput) => void;
  onDeleteExpense: (id: string) => void;
}

export function MiscExpensesPage({ 
  expenses, 
  onCreateExpense, 
  onUpdateExpense, 
  onDeleteExpense 
}: MiscExpensesPageProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MiscExpense | undefined>();

  const handleSubmit = (data: MiscExpenseInput) => {
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

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#2c5aa0" }}>Miscellaneous Expenses Management</h2>
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

      {showForm && (
        <div style={{ marginBottom: 24 }}>
          <MiscExpenseForm
            expense={editingExpense}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <MiscExpenseList
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
