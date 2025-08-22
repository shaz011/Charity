import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MiscExpenseInput, MiscExpense } from "../utils/types";

interface MiscExpenseFormProps {
  expense?: MiscExpense;
  onSubmit: (data: MiscExpenseInput) => void;
  onCancel: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Expense name is required"),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price must be >= 0"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .min(0.01, "Quantity must be > 0"),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, "Date must be YYYY-MM-DD"),
  notes: z.string().optional(),
});

export function MiscExpenseForm({ expense, onCancel, onSubmit }: MiscExpenseFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MiscExpenseInput>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? { ...expense }
      : {
          name: "",
          price: 0,
          quantity: 1,
          expenseDate: new Date().toISOString().slice(0, 10),
          notes: "",
        },
  });

  const price = watch("price") || 0;
  const quantity = watch("quantity") || 1;
  const totalCost = price * quantity;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h3 style={{ margin: 0, color: "#2c5aa0" }}>
        {expense ? "Edit Misc Expense" : "Add New Misc Expense"}
      </h3>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Expense Name *</span>
        <input
          type="text"
          placeholder="Enter expense name (e.g., Office supplies, Travel, etc.)"
          {...register("name")}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
        />
        {errors.name && <span style={{ color: "crimson" }}>{errors.name.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Price per Unit *</span>
        <input
          type="number"
          step={0.01}
          min={0}
          placeholder="Price per unit"
          {...register("price", { valueAsNumber: true })}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
        />
        {errors.price && <span style={{ color: "crimson" }}>{errors.price.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Quantity *</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          placeholder="Quantity"
          {...register("quantity", { valueAsNumber: true })}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
        />
        {errors.quantity && <span style={{ color: "crimson" }}>{errors.quantity.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Expense Date *</span>
        <input type="date" {...register("expenseDate")} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }} />
        {errors.expenseDate && <span style={{ color: "crimson" }}>{errors.expenseDate.message as string}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Notes (Optional)</span>
        <textarea
          placeholder="Additional notes about this expense"
          rows={3}
          {...register("notes")}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
        />
        {errors.notes && <span style={{ color: "crimson" }}>{errors.notes.message}</span>}
      </label>

      <div style={{ background: "#e0f7fa", padding: 12, borderRadius: 4 }}>
        <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
        {price > 0 && quantity > 0 && (
          <small style={{ display: "block", color: "#666", marginTop: 4 }}>
            Calculated: {quantity} × ${price.toFixed(2)} per unit
          </small>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={{ background: "#4caf50", color: "white", border: "none", padding: "8px 16px", borderRadius: 4 }}>
          {expense ? "Update Expense" : "Add Expense"}
        </button>
        <button type="button" onClick={onCancel} style={{ background: "#f44336", color: "white", border: "none", padding: "8px 16px", borderRadius: 4 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
