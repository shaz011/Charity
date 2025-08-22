import React, { useState, useMemo } from "react";
import { BankTransaction, BankTransactionInput, BankAccountSummary } from "../utils/types";

interface BankAccountPageProps {
  bankTransactions: BankTransaction[];
  onCreateTransaction: (input: BankTransactionInput) => Promise<void>;
  onUpdateTransaction: (id: string, input: BankTransactionInput) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export function BankAccountPage({ 
  bankTransactions, 
  onCreateTransaction, 
  onUpdateTransaction, 
  onDeleteTransaction 
}: BankAccountPageProps): JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BankTransactionInput>({
    type: "cash_received",
    amount: 0,
    transactionDate: new Date().toISOString().slice(0, 10),
    description: "",
    notes: "",
    reference: ""
  });

  const editingTransaction = useMemo(() => 
    bankTransactions.find(t => t.id === editingId) || null, 
    [bankTransactions, editingId]
  );

  // Calculate account summary
  const accountSummary: BankAccountSummary = useMemo(() => {
    const totalCashReceived = bankTransactions
      .filter(t => t.type === "cash_received")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCashWithdrawn = bankTransactions
      .filter(t => t.type === "cash_withdrawn")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = totalCashReceived - totalCashWithdrawn;
    
    const lastTransaction = bankTransactions.length > 0 
      ? bankTransactions[0] 
      : null;
    
    return {
      totalCashReceived,
      totalCashWithdrawn,
      currentBalance,
      lastTransactionDate: lastTransaction?.transactionDate || null,
      transactionCount: bankTransactions.length
    };
  }, [bankTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await onUpdateTransaction(editingId, formData);
      } else {
        await onCreateTransaction(formData);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleEdit = (transaction: BankTransaction) => {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      description: transaction.description,
      notes: transaction.notes || "",
      reference: transaction.reference || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await onDeleteTransaction(id);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      type: "cash_received",
      amount: 0,
      transactionDate: new Date().toISOString().slice(0, 10),
      description: "",
      notes: "",
      reference: ""
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 24px 0", color: "#2c3e50", textAlign: "center" }}>
        🏦 Bank Account Management
      </h1>

      {/* Account Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: 16, 
        marginBottom: 32 
      }}>
        {/* Current Balance */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            💰 Current Balance
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
            {formatCurrency(accountSummary.currentBalance)}
          </div>
          <small style={{ opacity: 0.8 }}>
            {accountSummary.transactionCount} transactions
          </small>
        </div>

        {/* Total Cash Received */}
        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📥 Total Received
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
            {formatCurrency(accountSummary.totalCashReceived)}
          </div>
          <small style={{ opacity: 0.8 }}>
            Cash deposits
          </small>
        </div>

        {/* Total Cash Withdrawn */}
        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📤 Total Withdrawn
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
            {formatCurrency(accountSummary.totalCashWithdrawn)}
          </div>
          <small style={{ opacity: 0.8 }}>
            Cash withdrawals
          </small>
        </div>

        {/* Last Transaction */}
        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📅 Last Transaction
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            {accountSummary.lastTransactionDate 
              ? formatDate(accountSummary.lastTransactionDate)
              : "No transactions"
            }
          </div>
          <small style={{ opacity: 0.8 }}>
            {accountSummary.transactionCount > 0 ? "Most recent activity" : "Start recording transactions"}
          </small>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0, color: "#2c3e50" }}>
          💳 Bank Transactions
        </h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
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
          ➕ {editingId ? "Update Transaction" : "Add Transaction"}
        </button>
      </div>

      {/* Transaction Form */}
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
            <h4 style={{ margin: 0, color: "#2c3e50" }}>
              {editingId ? "Update Transaction" : "Add New Transaction"}
            </h4>
            <button
              onClick={resetForm}
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
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Transaction Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "cash_received" | "cash_withdrawn" }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                required
              >
                <option value="cash_received">💰 Cash Received</option>
                <option value="cash_withdrawn">💸 Cash Withdrawn</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                required
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                placeholder="e.g., Monthly donation, Office supplies purchase"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                placeholder="Receipt number, check number, etc."
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                  minHeight: "60px"
                }}
                placeholder="Additional details about this transaction"
              />
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button
                type="submit"
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {editingId ? "Update Transaction" : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: 8, 
        overflow: "hidden",
        background: "white"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>
                Date
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>
                Type
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>
                Description
              </th>
              <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                Amount
              </th>
              <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                Running Balance
              </th>
              <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bankTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                  No transactions recorded yet. Start by adding your first transaction above.
                </td>
              </tr>
            ) : (
              bankTransactions.map((transaction) => (
                <tr key={transaction.id} style={{
                  background: transaction.type === "cash_received" ? "#f8fff8" : "#fff8f8"
                }}>
                  <td style={{ padding: "12px" }}>
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      background: transaction.type === "cash_received" ? "#d4edda" : "#f8d7da",
                      color: transaction.type === "cash_received" ? "#155724" : "#721c24",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {transaction.type === "cash_received" ? "💰 Received" : "💸 Withdrawn"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                      {transaction.description}
                    </div>
                    {transaction.reference && (
                      <small style={{ color: "#666", fontSize: "12px" }}>
                        Ref: {transaction.reference}
                      </small>
                    )}
                    {transaction.notes && (
                      <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                        {transaction.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    textAlign: "right", 
                    fontWeight: "bold",
                    color: transaction.type === "cash_received" ? "#28a745" : "#dc3545"
                  }}>
                    {transaction.type === "cash_received" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    textAlign: "right", 
                    fontWeight: "bold",
                    color: transaction.runningBalance >= 0 ? "#28a745" : "#dc3545"
                  }}>
                    {formatCurrency(transaction.runningBalance)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(transaction)}
                      style={{
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginRight: "8px"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
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

      {/* Help Section */}
      <div style={{ 
        background: "#e7f3ff", 
        padding: "16px", 
        borderRadius: "8px", 
        marginTop: "24px",
        border: "1px solid #b3d9ff"
      }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#0066cc" }}>ℹ️ How to Use Bank Account Management</h4>
        <div style={{ fontSize: "14px", color: "#0066cc", lineHeight: "1.5" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Cash Received:</strong> Record all cash deposits, donations, and income received
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Cash Withdrawn:</strong> Record all cash withdrawals, expenses paid in cash, and disbursements
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Running Balance:</strong> Automatically calculated running balance after each transaction
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Transaction History:</strong> View complete history of all bank transactions with details
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Account Summary:</strong> See current balance, total received, and total withdrawn at a glance
          </p>
        </div>
      </div>
    </div>
  );
}
