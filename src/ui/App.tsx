import React, { useMemo, useState, useEffect } from "react";
import { createBrowserRouter, Link, Outlet, RouterProvider } from "react-router-dom";
import { ProductList } from "./ProductList";
import { ProductForm } from "./ProductForm";
import { CustomProductManager } from "./CustomProductManager";
import { SalesPage } from "./SalesPage";
import { GeneralExpensesPage } from "./GeneralExpensesPage";
import { MiscExpensesPage } from "./MiscExpensesPage";
import { ItemConsumedPage } from "./ItemConsumedPage";
import { SummaryPage } from "./SummaryPage";
import { BankAccountPage } from "./BankAccountPage";
import { FamilyPaymentsPage } from "./FamilyPaymentsPage";
import { DatabaseStatus } from "./DatabaseStatus";
import { useDataStore } from "../utils/useDataStore";
import { Product, ProductInput, Sale, SaleInput, GeneralExpense, GeneralExpenseInput, MiscExpense, MiscExpenseInput, CustomProductInput, ItemConsumedInput } from "../utils/types";

function Layout(): JSX.Element {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Charity Inventory</h1>
        <nav style={{ background: "#f7f7f7", padding: 16, marginBottom: 16 }}>
          <Link to="/" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Products
          </Link>
          <Link to="/sales" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Sales
          </Link>
          <Link to="/expenses" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            General Expenses
          </Link>
          <Link to="/misc-expenses" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Misc Expenses
          </Link>
          <Link to="/consumed-items" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Items Consumed
          </Link>
          <Link to="/bank-account" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Bank Account
          </Link>
          <Link to="/family-payments" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Family Payments
          </Link>
          <Link to="/summary" style={{ marginRight: 16, textDecoration: "none", color: "#2c5aa0" }}>
            Summary
          </Link>
        </nav>
      </header>
      <Outlet />
      <DatabaseStatus />
    </div>
  );
}

function ProductsPage(): JSX.Element {
  const {
    products,
    sales,
    expenses,
    customItems,
    customProducts,
    consumedItems,
    loading,
    error,
    loadData,
    createProduct,
    updateProduct,
    deleteProduct,
    createSale,
    updateSale,
    deleteSale,
    createExpense,
    updateExpense,
    deleteExpense,
    createCustomItem,
    updateCustomItem,
    deleteCustomItem,
    createCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    createConsumedItem,
    updateConsumedItem,
    deleteConsumedItem,
    clearError,
  } = useDataStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingProduct = useMemo(() => products.find((p) => p.id === editingId) || null, [products, editingId]);
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'expenses'>('products');
  const [showCustomProductManager, setShowCustomProductManager] = useState(false);

  // Debug: Monitor products state changes
  useEffect(() => {
    console.log('Products state changed:', products.length, 'products');
    console.log('Products data:', products);
  }, [products]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#2c5aa0" }}>Charity Management System</h2>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            background: activeTab === 'products' ? "#2c5aa0" : "#f7f7f7",
            color: activeTab === 'products' ? "white" : "#333",
            border: "1px solid #ddd",
            padding: "12px 24px",
            cursor: "pointer",
            borderRadius: activeTab === 'products' ? "8px 8px 0 0" : "8px 8px 0 0",
          }}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            background: activeTab === 'sales' ? "#2c5aa0" : "#f7f7f7",
            color: activeTab === 'sales' ? "white" : "#333",
            border: "1px solid #ddd",
            padding: "12px 24px",
            cursor: "pointer",
            borderRadius: activeTab === 'sales' ? "8px 8px 0 0" : "8px 8px 0 0",
          }}
        >
          Sales
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            background: activeTab === 'expenses' ? "#2c5aa0" : "#f7f7f7",
            color: activeTab === 'expenses' ? "white" : "#333",
            border: "1px solid #ddd",
            padding: "12px 24px",
            cursor: "pointer",
            borderRadius: activeTab === 'expenses' ? "8px 8px 0 0" : "8px 8px 0 0",
          }}
        >
          General Expenses
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#2c5aa0" }}>Products Management</h3>
            {!editingId && (
              <button
                onClick={() => setEditingId("new")}
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
                ➕ Add New Product
              </button>
            )}
          </div>

          {editingId && (
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
                  {editingId === "new" ? "Create New Product" : "Edit Product"}
                </h4>
                <button
                  onClick={() => setEditingId(null)}
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
              <ProductForm
                product={editingId === "new" ? undefined : editingProduct || undefined}
                customProducts={customProducts}
                onSubmit={async (data) => {
                  try {
                    if (editingId === "new") {
                      await createProduct(data);
                    } else {
                      await updateProduct(editingId, data);
                    }
                    setEditingId(null);
                  } catch (err) {
                    console.error("Failed to save product:", err);
                  }
                }}
                onCancel={() => setEditingId(null)}
                onManageCustomProducts={() => setShowCustomProductManager(true)}
              />
            </div>
          )}

          <ProductList
            products={products}
            onEdit={setEditingId}
            onDelete={async (id) => {
              try {
                await deleteProduct(id);
              } catch (err) {
                console.error("Failed to delete product:", err);
                alert("Failed to delete product. Please try again.");
              }
            }}
          />

          {showCustomProductManager && (
            <CustomProductManager
              customProducts={customProducts}
              onAddProduct={async (data) => {
                try {
                  await createCustomProduct(data);
                } catch (err) {
                  console.error("Failed to create custom product:", err);
                }
              }}
              onUpdateProduct={async (id, data) => {
                try {
                  await updateCustomProduct(id, data);
                } catch (err) {
                  console.error("Failed to update custom product:", err);
                }
              }}
              onDeleteProduct={async (id) => {
                try {
                  await deleteCustomProduct(id);
                } catch (err) {
                  console.error("Failed to delete custom product:", err);
                }
              }}
              onClose={() => setShowCustomProductManager(false)}
            />
          )}
        </>
      )}

      {activeTab === 'sales' && (
        <SalesPage
          products={products}
          sales={sales}
          createSale={createSale}
          updateSale={updateSale}
          deleteSale={deleteSale}
          loading={loading}
          error={error}
          clearError={clearError}
        />
      )}

      {activeTab === 'expenses' && (
        <GeneralExpensesPage
          expenses={expenses}
          customItems={customItems}
          onCreateExpense={createExpense}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
          onCreateCustomItem={createCustomItem}
          onUpdateCustomItem={updateCustomItem}
          onDeleteCustomItem={deleteCustomItem}
        />
      )}

      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: 12, borderRadius: 4, marginTop: 16 }}>
          <strong>Error:</strong> {error}
          <button
            onClick={clearError}
            style={{
              background: "none",
              border: "none",
              color: "#721c24",
              cursor: "pointer",
              marginLeft: 8,
              textDecoration: "underline",
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function AppRouter(): JSX.Element {
  const { 
    products, 
    sales, 
    expenses, 
    miscExpenses,
    customItems,
    consumedItems,
    bankTransactions,
    familyPayments,
    familyMembers,
    createSale, 
    updateSale, 
    deleteSale, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    createMiscExpense,
    updateMiscExpense,
    deleteMiscExpense,
    createCustomItem,
    updateCustomItem,
    deleteCustomItem,
    createConsumedItem,
    updateConsumedItem,
    deleteConsumedItem,
    createBankTransaction,
    updateBankTransaction,
    deleteBankTransaction,
    createFamilyPayment,
    updateFamilyPayment,
    deleteFamilyPayment,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    loading, 
    error, 
    clearError 
  } = useDataStore();
  
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { index: true, element: <ProductsPage /> },
        { path: "sales", element: <SalesPage products={products} sales={sales} createSale={createSale} updateSale={updateSale} deleteSale={deleteSale} loading={loading} error={error} clearError={clearError} /> },
        { 
          path: "expenses", 
          element: <GeneralExpensesPage 
            expenses={expenses} 
            customItems={customItems}
            onCreateExpense={createExpense} 
            onUpdateExpense={updateExpense} 
            onDeleteExpense={deleteExpense}
            onCreateCustomItem={createCustomItem}
            onUpdateCustomItem={updateCustomItem}
            onDeleteCustomItem={deleteCustomItem}
          /> 
        },
        { 
          path: "misc-expenses", 
          element: <MiscExpensesPage 
            expenses={miscExpenses} 
            onCreateExpense={createMiscExpense} 
            onUpdateExpense={updateMiscExpense} 
            onDeleteExpense={deleteMiscExpense} 
          /> 
        },
        { 
          path: "consumed-items", 
          element: <ItemConsumedPage 
            consumedItems={consumedItems} 
            generalExpenses={expenses} 
            customItems={customItems}
            onCreateConsumedItem={createConsumedItem} 
            onUpdateConsumedItem={updateConsumedItem} 
            onDeleteConsumedItem={deleteConsumedItem} 
          /> 
        },
        { 
          path: "bank-account", 
          element: <BankAccountPage 
            bankTransactions={bankTransactions} 
            onCreateTransaction={createBankTransaction} 
            onUpdateTransaction={updateBankTransaction} 
            onDeleteTransaction={deleteBankTransaction} 
          /> 
        },
        { 
          path: "family-payments", 
          element: <FamilyPaymentsPage 
            familyPayments={familyPayments}
            familyMembers={familyMembers}
            onCreatePayment={createFamilyPayment}
            onUpdatePayment={updateFamilyPayment}
            onDeletePayment={deleteFamilyPayment}
            onCreateMember={createFamilyMember}
            onUpdateMember={updateFamilyMember}
            onDeleteMember={deleteFamilyMember}
          /> 
        },
        { 
          path: "summary", 
          element: <SummaryPage 
            sales={sales} 
            expenses={expenses} 
            miscExpenses={miscExpenses}
            consumedItems={consumedItems} 
          /> 
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export function App(): JSX.Element {
  return <AppRouter />;
}



