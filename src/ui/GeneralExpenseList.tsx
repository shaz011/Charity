import React from "react";
import { GeneralExpense } from "../utils/types";

interface GeneralExpenseListProps {
  expenses: GeneralExpense[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GeneralExpenseList({ expenses, onEdit, onDelete }: GeneralExpenseListProps): JSX.Element {
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.price * expense.quantity), 0);

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: "#f7f7f7", padding: 16, borderBottom: "1px solid #ddd" }}>
        <h3 style={{ margin: 0, color: "#2c5aa0" }}>General Expenses</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span>Total Expenses: <strong>${totalExpenses.toFixed(2)}</strong></span>
          <span>Total Items: <strong>{expenses.length}</strong></span>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f7f7f7" }}>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Item</th>
            <th style={{ textAlign: "left", padding: 8 }}>Unit</th>
            <th style={{ textAlign: "right", padding: 8 }}>Price/Unit</th>
            <th style={{ textAlign: "right", padding: 8 }}>Quantity</th>
            <th style={{ textAlign: "right", padding: 8 }}>Weight (kg)</th>
            <th style={{ textAlign: "right", padding: 8 }}>Total Cost</th>
            <th style={{ textAlign: "left", padding: 8 }}>Date</th>
            <th style={{ textAlign: "left", padding: 8 }}>Notes</th>
            <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: 12, textAlign: "center", color: "#666" }}>
                No expenses recorded yet
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id}>
                <td style={{ padding: 8, fontWeight: "bold" }}>{expense.name}</td>
                <td style={{ padding: 8 }}>{expense.unit}</td>
                <td style={{ padding: 8, textAlign: "right" }}>${expense.price.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{expense.quantity.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right", color: expense.weight ? "#2c5aa0" : "#666" }}>
                  {expense.weight ? `${expense.weight.toFixed(2)} kg` : "-"}
                </td>
                <td style={{ padding: 8, textAlign: "right", fontWeight: "bold", color: "#2c5aa0" }}>
                  ${(expense.price * expense.quantity).toFixed(2)}
                </td>
                <td style={{ padding: 8 }}>{expense.expenseDate}</td>
                <td style={{ padding: 8, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {expense.notes || "-"}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <button 
                    onClick={() => onEdit(expense.id)} 
                    style={{ marginRight: 8, background: "#2196f3", color: "white", border: "none", padding: "4px 8px", borderRadius: 4 }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(expense.id)} 
                    style={{ background: "#f44336", color: "white", border: "none", padding: "4px 8px", borderRadius: 4 }}
                  >
                    Delete
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
