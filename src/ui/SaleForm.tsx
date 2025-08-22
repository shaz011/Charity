import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleInput, Sale, Product } from "../utils/types";

interface SaleFormProps {
  products: Product[];
  sale?: Sale;
  onSubmit: (data: SaleInput) => void;
  onCancel: () => void;
}

const schema = z.object({
  productId: z.string().min(1, { message: "Select a product" }),
  weightBeforeSale: z
    .number({ error: "Weight before sale must be a number" })
    .min(0.01, "Weight before sale must be > 0"),
  weightAfterSale: z
    .number({ error: "Weight after sale must be a number" })
    .min(0, "Weight after sale must be >= 0"),
  weight: z
    .number({ error: "Weight must be a number" })
    .min(0.01, "Weight must be > 0"),
  pricePerKg: z
    .number({ error: "Price per kg must be a number" })
    .min(0, "Price per kg must be >= 0"),
  expectedCash: z
    .number({ error: "Expected cash must be a number" })
    .min(0, "Expected cash must be >= 0"),
  receivedCash: z
    .number({ error: "Received cash must be a number" })
    .min(0, "Received cash must be >= 0"),
  saleDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, "Date must be YYYY-MM-DD"),
  topup: z
    .number({ error: "Topup must be a number" })
    .min(0, "Topup must be >= 0"),
  charity: z
    .number({ error: "Charity amount must be a number" })
    .min(0, "Charity amount must be >= 0"),
  credit: z
    .number({ error: "Credit amount must be a number" })
    .min(0, "Credit amount must be >= 0"),
});

export function SaleForm({ products, sale, onCancel, onSubmit }: SaleFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SaleInput>({
    resolver: zodResolver(schema),
    defaultValues: sale
      ? { ...sale }
              : {
          productId: "",
          weightBeforeSale: 0,
          weightAfterSale: 0,
          weight: 0,
          pricePerKg: 0,
          expectedCash: 0,
          receivedCash: 0,
          saleDate: new Date().toISOString().slice(0, 10),
          topup: 0,
          charity: 0,
          credit: 0,
        },
  });

  useEffect(() => {
    if (sale) {
      reset(sale);
    } else {
      reset({
        productId: "",
        weightBeforeSale: 0,
        weightAfterSale: 0,
        weight: 0,
        pricePerKg: 0,
        expectedCash: 0,
        receivedCash: 0,
        saleDate: new Date().toISOString().slice(0, 10),
        topup: 0,
        charity: 0,
        credit: 0,
      });
    }
  }, [sale, reset]);

  // Watch for product selection changes to auto-populate price per kg
  const selectedProductId = watch("productId");
  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        if (selectedProduct.salePrice > 0) {
          setValue("pricePerKg", selectedProduct.salePrice);
        } else {
          setValue("pricePerKg", 0);
        }
      }
    }
  }, [selectedProductId, products, setValue]);

  const weightBeforeSale = watch("weightBeforeSale") || 0;
  const weightAfterSale = watch("weightAfterSale") || 0;
  const weight = watch("weight") || 0;
  const pricePerKg = watch("pricePerKg") || 0;
  const expectedCash = watch("expectedCash") || 0;
  const receivedCash = watch("receivedCash") || 0;
  const topup = watch("topup") || 0;
  const charity = watch("charity") || 0;
  const credit = watch("credit") || 0;

  // Auto-update actual weight sold when weight before and after sale change
  useEffect(() => {
    const actualWeightSold = weightBeforeSale - weightAfterSale;
    if (actualWeightSold >= 0) {
      setValue("weight", actualWeightSold);
    }
  }, [weightBeforeSale, weightAfterSale, setValue]);

  // Auto-update expected cash when weight or price per kg changes
  useEffect(() => {
    const newExpectedCash = weight * pricePerKg;
    if (newExpectedCash > 0) {
      setValue("expectedCash", newExpectedCash);
    }
  }, [weight, pricePerKg, setValue]);

  const calculatedExpectedCash = weight * pricePerKg;
  const totalReceived = receivedCash + topup + charity + credit;
  const arrears = expectedCash - totalReceived;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 4 }}>
        <span>Product</span>
        <select {...register("productId")}>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.unit}) - ${p.salePrice > 0 ? p.salePrice.toFixed(2) : 'No sale price'}
            </option>
          ))}
        </select>
        {errors.productId && <span style={{ color: "crimson" }}>{errors.productId.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Sale Date</span>
        <input type="date" {...register("saleDate")} />
        {errors.saleDate && <span style={{ color: "crimson" }}>{errors.saleDate.message as string}</span>}
      </label>

      <div style={{ background: "#f0f8ff", padding: 12, borderRadius: 4, border: "1px solid #b3d9ff" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#0066cc" }}>Weight Tracking</h4>
        <p style={{ margin: "0 0 12px 0", fontSize: "0.9em", color: "#666" }}>
          Record the weight of the item + container before and after sale (e.g., rice + pot)
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>Weight Before Sale (kg)</span>
            <input
              type="number"
              step={0.01}
              min={0.01}
              placeholder="e.g., 5.5 (rice + pot)"
              {...register("weightBeforeSale", { valueAsNumber: true })}
            />
            {errors.weightBeforeSale && <span style={{ color: "crimson" }}>{errors.weightBeforeSale.message}</span>}
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>Weight After Sale (kg)</span>
            <input
              type="number"
              step={0.01}
              min={0}
              placeholder="e.g., 2.3 (remaining rice + pot)"
              {...register("weightAfterSale", { valueAsNumber: true })}
            />
            {errors.weightAfterSale && <span style={{ color: "crimson" }}>{errors.weightAfterSale.message}</span>}
          </label>
        </div>

        <div style={{ 
          background: "#e8f5e8", 
          padding: 8, 
          borderRadius: 4, 
          marginTop: 8,
          border: "1px solid #c8e6c9"
        }}>
          <strong>Actual Weight Sold:</strong> {weight.toFixed(2)} kg
          <small style={{ display: "block", color: "#666", marginTop: 4 }}>
            Automatically calculated: {weightBeforeSale.toFixed(2)} kg - {weightAfterSale.toFixed(2)} kg
          </small>
        </div>
      </div>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Weight (kg) - Auto-calculated</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          {...register("weight", { valueAsNumber: true })}
          readOnly
          style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
        />
        <small style={{ color: "#666", fontSize: "0.8em" }}>
          This field is automatically calculated from weight before and after sale
        </small>
        {errors.weight && <span style={{ color: "crimson" }}>{errors.weight.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Price per kg</span>
        <input
          type="number"
          step={0.01}
          min={0}
          {...register("pricePerKg", { valueAsNumber: true })}
          readOnly
          style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
        />
        <small style={{ color: "#666", fontSize: "0.8em" }}>
          {selectedProductId && products.find(p => p.id === selectedProductId)?.salePrice === 0 
            ? "⚠️ No sale price set for this product. Please set a sale price in the product form first."
            : "Automatically set from product's sale price"
          }
        </small>
        {errors.pricePerKg && <span style={{ color: "crimson" }}>{errors.pricePerKg.message}</span>}
      </label>

      <div style={{ background: "#e0f7fa", padding: 12, borderRadius: 4 }}>
        <strong>Calculated Expected:</strong> ${calculatedExpectedCash.toFixed(2)}
        {weight > 0 && pricePerKg > 0 && (
          <small style={{ display: "block", color: "#666", marginTop: 4 }}>
            Automatically calculated: {weight} kg × ${pricePerKg.toFixed(2)}/kg
          </small>
        )}
      </div>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Expected Cash</span>
        <input
          type="number"
          step={0.01}
          min={0}
          {...register("expectedCash", { valueAsNumber: true })}
        />
        {errors.expectedCash && <span style={{ color: "crimson" }}>{errors.expectedCash.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Received Cash</span>
        <input
          type="number"
          step={0.01}
          min={0}
          {...register("receivedCash", { valueAsNumber: true })}
        />
        {errors.receivedCash && <span style={{ color: "crimson" }}>{errors.receivedCash.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Topup</span>
        <input
          type="number"
          step={0.01}
          min={0}
          placeholder="Additional payment/adjustment"
          {...register("topup", { valueAsNumber: true })}
        />
        {errors.topup && <span style={{ color: "crimson" }}>{errors.topup.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Charity</span>
        <input
          type="number"
          step={0.01}
          min={0}
          placeholder="Charity amount"
          {...register("charity", { valueAsNumber: true })}
        />
        {errors.charity && <span style={{ color: "crimson" }}>{errors.charity.message}</span>}
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Credit</span>
        <input
          type="number"
          step={0.01}
          min={0}
          placeholder="Credit amount"
          {...register("credit", { valueAsNumber: true })}
        />
        {errors.credit && <span style={{ color: "crimson" }}>{errors.credit.message}</span>}
      </label>

      <div style={{ background: "#fff3cd", padding: 12, borderRadius: 4 }}>
        <strong>Charity:</strong> ${charity.toFixed(2)}
        {charity > 0 && (
          <small style={{ display: "block", color: "#666", marginTop: 4 }}>
            This sale will be recorded for ${charity.toFixed(2)}
          </small>
        )}
      </div>

      <div style={{ background: "#e8f5e8", padding: 12, borderRadius: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <strong>Total Received:</strong>
            <div style={{ fontSize: "1.2em", color: "#2c5aa0" }}>
              ${totalReceived.toFixed(2)}
            </div>
            <small style={{ color: "#666" }}>
              Received: ${receivedCash.toFixed(2)} + Topup: ${topup.toFixed(2)} + Charity: ${charity.toFixed(2)} + Credit: ${credit.toFixed(2)}
            </small>
          </div>
          <div>
            <strong>Final Arrears:</strong>
            <div style={{ fontSize: "1.2em", color: arrears > 0 ? "#d32f2f" : "#388e3c" }}>
              ${arrears.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Record Sale</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
