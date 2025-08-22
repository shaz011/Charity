import React, { useState, useMemo } from "react";
import { FamilyPayment, FamilyPaymentInput, FamilyMember, FamilyMemberInput, FamilyPaymentSummary } from "../utils/types";

interface FamilyPaymentsPageProps {
  familyPayments: FamilyPayment[];
  familyMembers: FamilyMember[];
  onCreatePayment: (input: FamilyPaymentInput) => Promise<void>;
  onUpdatePayment: (id: string, input: FamilyPaymentInput) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
  onCreateMember: (input: FamilyMemberInput) => Promise<void>;
  onUpdateMember: (id: string, input: FamilyMemberInput) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export function FamilyPaymentsPage({ 
  familyPayments, 
  familyMembers,
  onCreatePayment, 
  onUpdatePayment, 
  onDeletePayment,
  onCreateMember,
  onUpdateMember,
  onDeleteMember
}: FamilyPaymentsPageProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'payments' | 'members'>('payments');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  
  const [paymentFormData, setPaymentFormData] = useState<FamilyPaymentInput>({
    familyMemberName: "",
    amount: 0,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentType: "monthly_support",
    description: "",
    notes: "",
    isRecurring: false,
    nextPaymentDue: ""
  });

  const [memberFormData, setMemberFormData] = useState<FamilyMemberInput>({
    name: "",
    relationship: "",
    monthlyAmount: 0,
    paymentDay: 1,
    isActive: true,
    notes: ""
  });

  const editingPayment = useMemo(() => 
    familyPayments.find(p => p.id === editingPaymentId) || null, 
    [familyPayments, editingPaymentId]
  );

  const editingMember = useMemo(() => 
    familyMembers.find(m => m.id === editingMemberId) || null, 
    [familyMembers, editingMemberId]
  );

  // Calculate payment summary
  const paymentSummary: FamilyPaymentSummary = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const totalPaidThisMonth = familyPayments
      .filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPaidThisYear = familyPayments
      .filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    const activeFamilyMembers = familyMembers.filter(m => m.isActive).length;
    
    const upcomingPayments = familyMembers
      .filter(m => m.isActive && m.monthlyAmount && m.paymentDay)
      .filter(m => {
        const today = currentDate.getDate();
        const paymentDay = m.paymentDay || 1;
        return paymentDay > today;
      }).length;
    
    const lastPayment = familyPayments.length > 0 
      ? familyPayments[0] 
      : null;
    
    return {
      totalPaidThisMonth,
      totalPaidThisYear,
      activeFamilyMembers,
      upcomingPayments,
      lastPaymentDate: lastPayment?.paymentDate || null,
      paymentCount: familyPayments.length
    };
  }, [familyPayments, familyMembers]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaymentId) {
        await onUpdatePayment(editingPaymentId, paymentFormData);
      } else {
        await onCreatePayment(paymentFormData);
      }
      resetPaymentForm();
    } catch (error) {
      console.error("Failed to save payment:", error);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMemberId) {
        await onUpdateMember(editingMemberId, memberFormData);
      } else {
        await onCreateMember(memberFormData);
      }
      resetMemberForm();
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const handleEditPayment = (payment: FamilyPayment) => {
    setEditingPaymentId(payment.id);
    setPaymentFormData({
      familyMemberName: payment.familyMemberName,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentType: payment.paymentType,
      description: payment.description,
      notes: payment.notes || "",
      isRecurring: payment.isRecurring,
      nextPaymentDue: payment.nextPaymentDue || ""
    });
    setShowPaymentForm(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setMemberFormData({
      name: member.name,
      relationship: member.relationship,
      monthlyAmount: member.monthlyAmount || 0,
      paymentDay: member.paymentDay || 1,
      isActive: member.isActive,
      notes: member.notes || ""
    });
    setShowMemberForm(true);
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await onDeletePayment(id);
      } catch (error) {
        console.error("Failed to delete payment:", error);
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this family member?")) {
      try {
        await onDeleteMember(id);
      } catch (error) {
        console.error("Failed to delete member:", error);
      }
    }
  };

  const resetPaymentForm = () => {
    setEditingPaymentId(null);
    setShowPaymentForm(false);
    setPaymentFormData({
      familyMemberName: "",
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentType: "monthly_support",
      description: "",
      notes: "",
      isRecurring: false,
      nextPaymentDue: ""
    });
  };

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setShowMemberForm(false);
    setMemberFormData({
      name: "",
      relationship: "",
      monthlyAmount: 0,
      paymentDay: 1,
      isActive: true,
      notes: ""
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

  const getPaymentTypeLabel = (type: string) => {
    const labels = {
      'monthly_support': '💰 Monthly Support',
      'emergency': '🚨 Emergency',
      'special_occasion': '🎉 Special Occasion',
      'education': '📚 Education',
      'medical': '🏥 Medical',
      'other': '📝 Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const quickAddPayment = (member: FamilyMember) => {
    setPaymentFormData({
      familyMemberName: member.name,
      amount: member.monthlyAmount || 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentType: "monthly_support",
      description: `Monthly support for ${member.name}`,
      notes: "",
      isRecurring: true,
      nextPaymentDue: member.paymentDay ? 
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, member.paymentDay).toISOString().slice(0, 10) : ""
    });
    setShowPaymentForm(true);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 24px 0", color: "#2c3e50", textAlign: "center" }}>
        👨‍👩‍👧‍👦 Family Payments Management
      </h1>

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: 16, 
        marginBottom: 32 
      }}>
        {/* This Month Total */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
            📅 This Month
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {formatCurrency(paymentSummary.totalPaidThisMonth)}
          </div>
          <small style={{ opacity: 0.8 }}>
            Paid to family members
          </small>
        </div>

        {/* This Year Total */}
        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
            📊 This Year
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {formatCurrency(paymentSummary.totalPaidThisYear)}
          </div>
          <small style={{ opacity: 0.8 }}>
            Total family support
          </small>
        </div>

        {/* Active Family Members */}
        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
            👥 Active Members
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {paymentSummary.activeFamilyMembers}
          </div>
          <small style={{ opacity: 0.8 }}>
            Receiving support
          </small>
        </div>

        {/* Upcoming Payments */}
        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
            ⏰ Upcoming
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {paymentSummary.upcomingPayments}
          </div>
          <small style={{ opacity: 0.8 }}>
            Payments this month
          </small>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            background: activeTab === 'payments' ? "#2c5aa0" : "#f7f7f7",
            color: activeTab === 'payments' ? "white" : "#333",
            border: "1px solid #ddd",
            padding: "12px 24px",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          💳 Payments History
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            background: activeTab === 'members' ? "#2c5aa0" : "#f7f7f7",
            color: activeTab === 'members' ? "white" : "#333",
            border: "1px solid #ddd",
            padding: "12px 24px",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          👥 Family Members
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: 24 
          }}>
            <h2 style={{ margin: 0, color: "#2c3e50" }}>
              💳 Family Payments
            </h2>
            <button
              onClick={() => setShowPaymentForm(true)}
              style={{
                background: "#4caf50",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              ➕ Add Payment
            </button>
          </div>

          {/* Quick Add from Family Members */}
          {familyMembers.filter(m => m.isActive).length > 0 && (
            <div style={{
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              border: "1px solid #e9ecef"
            }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#495057" }}>
                ⚡ Quick Add Monthly Payments
              </h4>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {familyMembers.filter(m => m.isActive).map(member => (
                  <button
                    key={member.id}
                    onClick={() => quickAddPayment(member)}
                    style={{
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    {member.name} {member.monthlyAmount ? `(${formatCurrency(member.monthlyAmount)})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && (
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
                  {editingPaymentId ? "Update Payment" : "Add New Payment"}
                </h4>
                <button
                  onClick={resetPaymentForm}
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
              
              <form onSubmit={handlePaymentSubmit} style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Family Member Name *
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.familyMemberName}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, familyMemberName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    placeholder="e.g., Mother, John, Sarah"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
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

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Payment Type *
                  </label>
                  <select
                    value={paymentFormData.paymentType}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentType: e.target.value as any }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    required
                  >
                    <option value="monthly_support">💰 Monthly Support</option>
                    <option value="emergency">🚨 Emergency</option>
                    <option value="special_occasion">🎉 Special Occasion</option>
                    <option value="education">📚 Education</option>
                    <option value="medical">🏥 Medical</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Description *
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.description}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    placeholder="e.g., Monthly living expenses, Medical bills, School fees"
                    required
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={paymentFormData.isRecurring}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <label htmlFor="isRecurring" style={{ fontWeight: "500", color: "#495057" }}>
                    Recurring Monthly Payment
                  </label>
                </div>

                {paymentFormData.isRecurring && (
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                      Next Payment Due
                    </label>
                    <input
                      type="date"
                      value={paymentFormData.nextPaymentDue}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, nextPaymentDue: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                )}

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Notes
                  </label>
                  <textarea
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                      minHeight: "60px"
                    }}
                    placeholder="Additional notes about this payment"
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
                    {editingPaymentId ? "Update Payment" : "Add Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payments Table */}
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
                    Family Member
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>
                    Date & Type
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>
                    Description
                  </th>
                  <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                    Amount
                  </th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {familyPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                      No family payments recorded yet. Start by adding your first payment above.
                    </td>
                  </tr>
                ) : (
                  familyPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                          {payment.familyMemberName}
                        </div>
                        {payment.isRecurring && (
                          <small style={{ color: "#28a745", fontSize: "12px" }}>
                            🔄 Recurring
                          </small>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ marginBottom: "4px" }}>
                          {formatDate(payment.paymentDate)}
                        </div>
                        <span style={{
                          background: "#e9ecef",
                          color: "#495057",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "500"
                        }}>
                          {getPaymentTypeLabel(payment.paymentType)}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                          {payment.description}
                        </div>
                        {payment.notes && (
                          <div style={{ color: "#666", fontSize: "12px" }}>
                            {payment.notes}
                          </div>
                        )}
                        {payment.nextPaymentDue && (
                          <div style={{ color: "#007bff", fontSize: "12px", marginTop: "4px" }}>
                            Next: {formatDate(payment.nextPaymentDue)}
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: "12px", 
                        textAlign: "right", 
                        fontWeight: "bold",
                        color: "#28a745",
                        fontSize: "16px"
                      }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => handleEditPayment(payment)}
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
                          onClick={() => handleDeletePayment(payment.id)}
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
        </div>
      )}

      {/* Family Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: 24 
          }}>
            <h2 style={{ margin: 0, color: "#2c3e50" }}>
              👥 Family Members
            </h2>
            <button
              onClick={() => setShowMemberForm(true)}
              style={{
                background: "#4caf50",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              ➕ Add Family Member
            </button>
          </div>

          {/* Member Form */}
          {showMemberForm && (
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
                  {editingMemberId ? "Update Family Member" : "Add New Family Member"}
                </h4>
                <button
                  onClick={resetMemberForm}
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
              
              <form onSubmit={handleMemberSubmit} style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    placeholder="e.g., Sarah, John, Mother"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Relationship *
                  </label>
                  <input
                    type="text"
                    value={memberFormData.relationship}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    placeholder="e.g., Mother, Brother, Sister, Child"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Monthly Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={memberFormData.monthlyAmount}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, monthlyAmount: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Payment Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={memberFormData.paymentDay}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, paymentDay: parseInt(e.target.value) || 1 }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={memberFormData.isActive}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <label htmlFor="isActive" style={{ fontWeight: "500", color: "#495057" }}>
                    Active Member
                  </label>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#495057" }}>
                    Notes
                  </label>
                  <textarea
                    value={memberFormData.notes}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, notes: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                      minHeight: "60px"
                    }}
                    placeholder="Additional information about this family member"
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
                    {editingMemberId ? "Update Member" : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Family Members Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: 16 
          }}>
            {familyMembers.length === 0 ? (
              <div style={{ 
                gridColumn: "1 / -1", 
                padding: "40px", 
                textAlign: "center", 
                color: "#666",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}>
                No family members added yet. Start by adding your first family member above.
              </div>
            ) : (
              familyMembers.map((member) => (
                <div key={member.id} style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#2c3e50" }}>
                        {member.name}
                      </h4>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        {member.relationship}
                      </div>
                    </div>
                    <div style={{
                      background: member.isActive ? "#d4edda" : "#f8d7da",
                      color: member.isActive ? "#155724" : "#721c24",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "500"
                    }}>
                      {member.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {member.monthlyAmount && (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                        {formatCurrency(member.monthlyAmount)}
                      </span>
                      <span style={{ color: "#666", fontSize: "12px", marginLeft: "8px" }}>
                        monthly
                      </span>
                    </div>
                  )}

                  {member.paymentDay && (
                    <div style={{ color: "#666", fontSize: "12px", marginBottom: "8px" }}>
                      📅 Payment day: {member.paymentDay}
                    </div>
                  )}

                  {member.notes && (
                    <div style={{ color: "#666", fontSize: "12px", marginBottom: "12px", fontStyle: "italic" }}>
                      {member.notes}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      onClick={() => quickAddPayment(member)}
                      style={{
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "500"
                      }}
                    >
                      💰 Add Payment
                    </button>
                    <button
                      onClick={() => handleEditMember(member)}
                      style={{
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div style={{ 
        background: "#e7f3ff", 
        padding: "16px", 
        borderRadius: "8px", 
        marginTop: "24px",
        border: "1px solid #b3d9ff"
      }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#0066cc" }}>ℹ️ How to Use Family Payments Management</h4>
        <div style={{ fontSize: "14px", color: "#0066cc", lineHeight: "1.5" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Family Members:</strong> Add family members with their details and monthly amounts
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Quick Payments:</strong> Use the quick add buttons to create payments from member profiles
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Payment Types:</strong> Categorize payments (monthly support, emergency, medical, etc.)
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Recurring Payments:</strong> Set up recurring monthly payments with due dates
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Summary Dashboard:</strong> Track monthly and yearly totals, active members, and upcoming payments
          </p>
        </div>
      </div>
    </div>
  );
}

