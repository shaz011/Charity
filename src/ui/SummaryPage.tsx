import React, { useMemo } from "react";
import { Sale, GeneralExpense, MiscExpense, ItemConsumed } from "../utils/types";

interface SummaryPageProps {
  sales: Sale[];
  expenses: GeneralExpense[];
  miscExpenses: MiscExpense[];
  consumedItems: ItemConsumed[];
}

interface DailySummary {
  date: string;
  salesRevenue: number;
  consumptionCost: number;
  expenseCost: number;
  totalCost: number;
  profit: number;
  salesCount: number;
  consumptionCount: number;
  expenseCount: number;
}

export function SummaryPage({ sales, expenses, miscExpenses, consumedItems }: SummaryPageProps): JSX.Element {
  // Calculate daily summaries
  const dailySummaries = useMemo(() => {
    const summaryMap = new Map<string, DailySummary>();

    // Process sales
    sales.forEach(sale => {
      const date = sale.saleDate;
      const revenue = sale.receivedCash + sale.topup + sale.charity + sale.credit;
      
      if (!summaryMap.has(date)) {
        summaryMap.set(date, {
          date,
          salesRevenue: 0,
          consumptionCost: 0,
          expenseCost: 0,
          totalCost: 0,
          profit: 0,
          salesCount: 0,
          consumptionCount: 0,
          expenseCount: 0
        });
      }
      
      const summary = summaryMap.get(date)!;
      summary.salesRevenue += revenue;
      summary.salesCount += 1;
    });

    // Process consumed items
    consumedItems.forEach(item => {
      const date = item.consumptionDate;
      const cost = (item.price || 0) * item.quantity;
      
      if (!summaryMap.has(date)) {
        summaryMap.set(date, {
          date,
          salesRevenue: 0,
          consumptionCost: 0,
          expenseCost: 0,
          totalCost: 0,
          profit: 0,
          salesCount: 0,
          consumptionCount: 0,
          expenseCount: 0
        });
      }
      
      const summary = summaryMap.get(date)!;
      summary.consumptionCost += cost;
      summary.consumptionCount += 1;
    });

    // Process expenses
    expenses.forEach(expense => {
      const date = expense.expenseDate;
      const cost = expense.price * expense.quantity;
      
      if (!summaryMap.has(date)) {
        summaryMap.set(date, {
          date,
          salesRevenue: 0,
          consumptionCost: 0,
          expenseCost: 0,
          totalCost: 0,
          profit: 0,
          salesCount: 0,
          consumptionCount: 0,
          expenseCount: 0
        });
      }
      
      const summary = summaryMap.get(date)!;
      summary.expenseCost += cost;
      summary.expenseCount += 1;
    });

    // Process misc expenses
    miscExpenses.forEach(expense => {
      const date = expense.expenseDate;
      const cost = expense.price * expense.quantity;
      
      if (!summaryMap.has(date)) {
        summaryMap.set(date, {
          date,
          salesRevenue: 0,
          consumptionCost: 0,
          expenseCost: 0,
          totalCost: 0,
          profit: 0,
          salesCount: 0,
          consumptionCount: 0,
          expenseCount: 0
        });
      }
      
      const summary = summaryMap.get(date)!;
      summary.expenseCost += cost;
      summary.expenseCount += 1;
    });

    // Calculate total cost and profit for each day
    summaryMap.forEach(summary => {
      summary.totalCost = summary.consumptionCost + summary.expenseCost;
      summary.profit = summary.salesRevenue - summary.totalCost;
    });

    // Convert to array and sort by date (newest first)
    return Array.from(summaryMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, consumedItems, expenses, miscExpenses]);

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    const totalSalesRevenue = sales.reduce((sum, sale) => 
      sum + sale.receivedCash + sale.topup + sale.charity + sale.credit, 0);
    
    const totalConsumptionCost = consumedItems.reduce((sum, item) => 
      sum + ((item.price || 0) * item.quantity), 0);
    
    const totalExpenseCost = expenses.reduce((sum, expense) => 
      sum + (expense.price * expense.quantity), 0);
    
    const totalMiscExpenseCost = miscExpenses.reduce((sum, expense) => 
      sum + (expense.price * expense.quantity), 0);
    
    const totalCost = totalConsumptionCost + totalExpenseCost + totalMiscExpenseCost;
    const totalProfit = totalSalesRevenue - totalCost;
    
    return {
      totalSalesRevenue,
      totalConsumptionCost,
      totalExpenseCost,
      totalMiscExpenseCost,
      totalCost,
      totalProfit,
      totalSales: sales.length,
      totalConsumption: consumedItems.length,
      totalExpenses: expenses.length + miscExpenses.length
    };
  }, [sales, consumedItems, expenses, miscExpenses]);

  // Get today's summary
  const today = new Date().toISOString().slice(0, 10);
  const todaySummary = dailySummaries.find(summary => summary.date === today);

  // Get this month's summary
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthSummaries = dailySummaries.filter(summary => 
    summary.date.startsWith(thisMonth)
  );
  
  const monthTotals = useMemo(() => {
    const monthSalesRevenue = thisMonthSummaries.reduce((sum, summary) => 
      sum + summary.salesRevenue, 0);
    const monthConsumptionCost = thisMonthSummaries.reduce((sum, summary) => 
      sum + summary.consumptionCost, 0);
    const monthExpenseCost = thisMonthSummaries.reduce((sum, summary) => 
      sum + summary.expenseCost, 0);
    const monthTotalCost = thisMonthSummaries.reduce((sum, summary) => 
      sum + summary.totalCost, 0);
    const monthProfit = monthSalesRevenue - monthTotalCost;
    
    return {
      monthSalesRevenue,
      monthConsumptionCost,
      monthExpenseCost,
      monthTotalCost,
      monthProfit,
      monthDays: thisMonthSummaries.length
    };
  }, [thisMonthSummaries]);

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
        📊 Daily Financial Summary
      </h1>

      {/* Overview Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: 16, 
        marginBottom: 32 
      }}>
        {/* Today's Summary */}
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
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Revenue: {todaySummary ? formatCurrency(todaySummary.salesRevenue) : "$0.00"}
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Cost: {todaySummary ? formatCurrency(todaySummary.totalCost) : "$0.00"}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Consumption: {todaySummary ? formatCurrency(todaySummary.consumptionCost) : "$0.00"}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Expenses: {todaySummary ? formatCurrency(todaySummary.expenseCost) : "$0.00"}
          </div>
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            color: todaySummary && todaySummary.profit >= 0 ? "#a8f5a8" : "#ffb3b3" 
          }}>
            {todaySummary ? formatCurrency(todaySummary.profit) : "$0.00"}
          </div>
          <small style={{ opacity: 0.8 }}>
            {todaySummary ? `${todaySummary.salesCount} sales, ${todaySummary.consumptionCount} items consumed` : "No activity"}
          </small>
        </div>

        {/* This Month */}
        <div style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            📊 This Month
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Revenue: {formatCurrency(monthTotals.monthSalesRevenue)}
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Cost: {formatCurrency(monthTotals.monthTotalCost)}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Consumption: {formatCurrency(monthTotals.monthConsumptionCost)}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Expenses: {formatCurrency(monthTotals.monthExpenseCost)}
          </div>
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            color: monthTotals.monthProfit >= 0 ? "#a8f5a8" : "#ffb3b3" 
          }}>
            {formatCurrency(monthTotals.monthProfit)}
          </div>
          <small style={{ opacity: 0.8 }}>
            {monthTotals.monthDays} days tracked
          </small>
        </div>

        {/* Overall Totals */}
        <div style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            🎯 Overall
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Revenue: {formatCurrency(overallTotals.totalSalesRevenue)}
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            Cost: {formatCurrency(overallTotals.totalCost)}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Consumption: {formatCurrency(overallTotals.totalConsumptionCost)}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "4px", opacity: 0.9 }}>
            Expenses: {formatCurrency(overallTotals.totalExpenseCost + overallTotals.totalMiscExpenseCost)}
          </div>
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            color: overallTotals.totalProfit >= 0 ? "#a8f5a8" : "#ffb3b3" 
          }}>
            {formatCurrency(overallTotals.totalProfit)}
          </div>
          <small style={{ opacity: 0.8 }}>
            {overallTotals.totalSales} sales, {overallTotals.totalConsumption} items consumed, {overallTotals.totalExpenses} expenses
          </small>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 16px 0", color: "#2c3e50" }}>
          📈 Daily Breakdown
        </h2>
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
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                  Sales Revenue
                </th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                  Consumption Cost
                </th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                  Expense Cost
                </th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                  Total Cost
                </th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #dee2e6" }}>
                  Profit/Loss
                </th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                  Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {dailySummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                    No data available
                  </td>
                </tr>
              ) : (
                dailySummaries.map((summary) => (
                  <tr key={summary.date} style={{
                    background: summary.date === today ? "#f0f8ff" : "white"
                  }}>
                    <td style={{ padding: "12px", fontWeight: summary.date === today ? "bold" : "normal" }}>
                      {formatDate(summary.date)}
                      {summary.date === today && (
                        <span style={{ 
                          background: "#007bff", 
                          color: "white", 
                          padding: "2px 8px", 
                          borderRadius: "12px", 
                          fontSize: "12px", 
                          marginLeft: "8px" 
                        }}>
                          TODAY
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#28a745" }}>
                      {formatCurrency(summary.salesRevenue)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#dc3545" }}>
                      {formatCurrency(summary.consumptionCost)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#fd7e14" }}>
                      {formatCurrency(summary.expenseCost)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#6f42c1", fontWeight: "bold" }}>
                      {formatCurrency(summary.totalCost)}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "right", 
                      fontWeight: "bold",
                      color: summary.profit >= 0 ? "#28a745" : "#dc3545"
                    }}>
                      {summary.profit >= 0 ? "+" : ""}{formatCurrency(summary.profit)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontSize: "14px" }}>
                      <div style={{ marginBottom: "4px" }}>
                        💰 {summary.salesCount} sales
                      </div>
                      <div>
                        🍽️ {summary.consumptionCount} items
                      </div>
                      <div>
                        💰 {summary.expenseCount} expenses
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div style={{ 
        background: "#f8f9fa", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#2c3e50" }}>
          💡 Key Insights
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <div>
            <h4 style={{ margin: "0 0 8px 0", color: "#495057" }}>📊 Performance Metrics</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#6c757d" }}>
              <li>Average daily revenue: {formatCurrency(overallTotals.totalSalesRevenue / Math.max(dailySummaries.length, 1))}</li>
              <li>Average daily cost: {formatCurrency(overallTotals.totalCost / Math.max(dailySummaries.length, 1))}</li>
              <li>Average daily consumption: {formatCurrency(overallTotals.totalConsumptionCost / Math.max(dailySummaries.length, 1))}</li>
              <li>Average daily expenses: {formatCurrency((overallTotals.totalExpenseCost + overallTotals.totalMiscExpenseCost) / Math.max(dailySummaries.length, 1))}</li>
              <li>Profit margin: {((overallTotals.totalProfit / overallTotals.totalSalesRevenue) * 100).toFixed(1)}%</li>
            </ul>
          </div>
          <div>
            <h4 style={{ margin: "0 0 8px 0", color: "#495057" }}>🎯 Recommendations</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#6c757d" }}>
              <li>Track daily consumption patterns</li>
              <li>Monitor profit margins by product</li>
              <li>Identify high-cost consumption days</li>
              <li>Optimize inventory management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div style={{ 
        background: "#e7f3ff", 
        padding: "16px", 
        borderRadius: "8px", 
        marginTop: "24px",
        border: "1px solid #b3d9ff"
      }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#0066cc" }}>ℹ️ How to Use This Summary</h4>
        <div style={{ fontSize: "14px", color: "#0066cc", lineHeight: "1.5" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Daily Summary:</strong> View revenue, costs, and profit for each day
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Profit Calculation:</strong> Sales Revenue - (Consumption Cost + Expense Cost) = Daily Profit
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Trend Analysis:</strong> Identify patterns in daily financial performance
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Cost Control:</strong> Monitor daily consumption and expense costs to optimize spending
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            • <strong>Expense Tracking:</strong> Track both consumption costs and general/misc expenses for complete financial picture
          </p>
        </div>
      </div>
    </div>
  );
}
