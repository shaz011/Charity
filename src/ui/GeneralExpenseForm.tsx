import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralExpenseInput, GeneralExpense, CustomItem } from "../utils/types";

interface GeneralExpenseFormProps {
  expense?: GeneralExpense;
  customItems: CustomItem[];
  onManageCustomItems: () => void;
  onSubmit: (data: GeneralExpenseInput) => void;
  onCancel: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Select an item"),
  unit: z.enum(["kg", "pack", "piece", "liter", "dozen", "gram", "bottle", "packet"], { error: "Select a unit" }),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price must be >= 0"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .min(0.01, "Quantity must be > 0"),
  weight: z
    .number({ error: "Weight must be a number" })
    .min(0, "Weight must be >= 0")
    .optional(),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, "Date must be YYYY-MM-DD"),
  notes: z.string().optional(),
});

// Predefined items
const PREDEFINED_ITEMS = [
  "Onions", "Tomatto", "Hari Mirch", "Dhania Podina", "Petrol", "Naan", 
  "Chicken", "Eggs", "Laal Mirch", "Berf", "Cheeni", "Haldi", 
  "Garam Masala", "Ghee", "Shopper", "Jaam e Shereen", "Soap", 
  "Zarda Rang", "Lakriya"
];

export function GeneralExpenseForm({ 
  expense, 
  customItems, 
  onManageCustomItems, 
  onCancel, 
  onSubmit 
}: GeneralExpenseFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<GeneralExpenseInput>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? { ...expense }
      : {
          name: "Onions",
          unit: "kg",
          price: 0,
          quantity: 0,
          weight: 0,
          expenseDate: new Date().toISOString().slice(0, 10),
          notes: "",
        },
  });

  const price = watch("price") || 0;
  const quantity = watch("quantity") || 0;
  const totalCost = price * quantity;

  // Combine predefined and custom items
  const allItems = [...PREDEFINED_ITEMS, ...customItems.map(item => item.name)];

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h3 style={{ margin: 0, color: "#2c5aa0" }}>
        {expense ? "Edit Expense" : "Record New Expense"}
      </h3>

      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 4, flex: 1 }}>
            <span>Item Name</span>
            <select {...register("name")} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}>
              <optgroup label="Predefined Items">
                {PREDEFINED_ITEMS.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
              {customItems.length > 0 && (
                <optgroup label="Custom Items">
                  {customItems.map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            {errors.name && <span style={{ color: "crimson" }}>{errors.name.message}</span>}
          </label>
          
          <button
            type="button"
            onClick={onManageCustomItems}
            style={{
              background: "#2196f3",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Manage Items
          </button>
        </div>

        <label style={{ display: "grid", gap: 4 }}>
          <span>Unit</span>
          <select {...register("unit")} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}>
            <option value="kg">Kilogram (kg)</option>
            <option value="pack">Pack</option>
            <option value="piece">Piece</option>
            <option value="liter">Liter</option>
            <option value="dozen">Dozen</option>
            <option value="gram">Gram</option>
            <option value="bottle">Bottle</option>
            <option value="packet">Packet</option>
          </select>
          {errors.unit && <span style={{ color: "crimson" }}>{errors.unit.message}</span>}
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span>Price per Unit</span>
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
          <span>Quantity</span>
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
          <span>Weight (kg) - Optional</span>
          <input
            type="number"
            step={0.01}
            min={0}
            placeholder="Weight in kg (optional)"
            {...register("weight", { valueAsNumber: true })}
            style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
          />
          {errors.weight && <span style={{ color: "crimson" }}>{errors.weight.message}</span>}
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span>Expense Date</span>
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
      </div>

      <div style={{ background: "#e0f7fa", padding: 12, borderRadius: 4 }}>
        <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
        {price > 0 && quantity > 0 && (
          <small style={{ display: "block", color: "#666", marginTop: 4 }}>
            Calculated: {quantity} × ${price.toFixed(2)} per {watch("unit")}
          </small>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={{ background: "#4caf50", color: "white", border: "none", padding: "8px 16px", borderRadius: 4 }}>
          {expense ? "Update Expense" : "Record Expense"}
        </button>
        <button type="button" onClick={onCancel} style={{ background: "#f44336", color: "white", border: "none", padding: "8px 16px", borderRadius: 4 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
