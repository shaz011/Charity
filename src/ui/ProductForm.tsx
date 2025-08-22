import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductInput, CustomProductInput } from "../utils/types";

interface ProductFormProps {
  product?: { id: string } & ProductInput;
  customProducts?: CustomProductInput[];
  onSubmit: (data: ProductInput) => void;
  onCancel: () => void;
  onManageCustomProducts?: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  unit: z.enum(["kg", "pack"]),
  salePrice: z.number().min(0, "Sale price must be >= 0"),
  quantity: z.number().min(0, "Quantity must be >= 0"),
  buyingDate: z.string().min(1, "Sale date is required"),
});

export function ProductForm({ product, customProducts = [], onSubmit, onCancel, onManageCustomProducts }: ProductFormProps): JSX.Element {
  const [isCustomName, setIsCustomName] = useState(false);
  const [customName, setCustomName] = useState("");
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", unit: "kg", salePrice: 0, quantity: 0, buyingDate: new Date().toISOString().slice(0, 10) },
  });

  const selectedName = watch("name");

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("unit", product.unit);
      setValue("salePrice", product.salePrice ?? 0);
      setValue("quantity", product.quantity ?? 0);
      setValue("buyingDate", product.buyingDate ?? new Date().toISOString().slice(0, 10));
      
      // Check if the product name is a custom name not in the dropdown
      const isCustom = !customProducts.some(cp => cp.name === product.name);
      setIsCustomName(isCustom);
      if (isCustom) {
        setCustomName(product.name);
      }
    } else {
      setValue("name", "");
      setValue("unit", "kg");
      setValue("salePrice", 0);
      setValue("quantity", 0);
      setValue("buyingDate", new Date().toISOString().slice(0, 10));
      setIsCustomName(false);
      setCustomName("");
    }
  }, [product, setValue, customProducts]);

  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustomName(true);
      setValue("name", customName);
    } else {
      setIsCustomName(false);
      setValue("name", value);
      setCustomName("");
      
      // Auto-set the unit if a custom product is selected
      const selectedCustomProduct = customProducts.find(cp => cp.name === value);
      if (selectedCustomProduct) {
        setValue("unit", selectedCustomProduct.unit);
      }
    }
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomName(value);
    setValue("name", value);
  };

  const handleFormSubmit = async (data: ProductInput) => {
    try {
      console.log('=== PRODUCT FORM HANDLER START ===');
      console.log('Form data received:', data);
      console.log('Form validation passed');
      console.log('Calling onSubmit with data:', data);
      
      await onSubmit(data);
      
      console.log('onSubmit completed successfully');
      
      // Reset form after successful submission (only for new products)
      if (!product) {
        console.log('Resetting form for new product');
        reset({
          name: "",
          unit: "kg",
          salePrice: 0,
          quantity: 0,
          buyingDate: new Date().toISOString().slice(0, 10),
        });
        console.log('Form reset completed');
      }
      
      console.log('=== PRODUCT FORM HANDLER END ===');
    } catch (error) {
      console.error('=== PRODUCT FORM HANDLER ERROR ===');
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Product Name *</span>
          <div style={{ display: "flex", gap: "8" }}>
            {isCustomName ? (
              <div style={{ display: "flex", gap: "8", flex: 1 }}>
                <input
                  type="text"
                  placeholder="Enter custom product name"
                  value={customName}
                  onChange={handleCustomNameChange}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomName(false);
                    setCustomName("");
                    setValue("name", "");
                  }}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    whiteSpace: "nowrap"
                  }}
                  title="Switch back to dropdown"
                >
                  🔄
                </button>
              </div>
            ) : (
              <select
                value={selectedName}
                onChange={handleNameChange}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: selectedName && selectedName !== "custom" ? "2px solid #28a745" : "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: selectedName && selectedName !== "custom" ? "#f8fff9" : "white",
                  fontWeight: selectedName && selectedName !== "custom" ? "500" : "normal"
                }}
              >
                <option value="">Select a product</option>
                {customProducts.length === 0 ? (
                  <option value="custom" disabled>
                    No custom products yet - Click "Manage" to add some
                  </option>
                ) : (
                  <>
                    {customProducts.map((cp) => (
                      <option key={cp.id} value={cp.name}>
                        {cp.name} ({cp.unit})
                      </option>
                    ))}
                    <option value="custom">➕ Add Custom Product</option>
                  </>
                )}
              </select>
            )}
            {onManageCustomProducts && (
              <button
                type="button"
                onClick={onManageCustomProducts}
                style={{
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#138496"}
                onMouseOut={(e) => e.currentTarget.style.background = "#17a2b8"}
                title="Manage custom products"
              >
                ⚙️ Manage
              </button>
            )}
          </div>
          {errors.name && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.name.message}</span>}
          {customProducts.length === 0 && !errors.name && (
            <span style={{ color: "#6c757d", fontSize: "12px" }}>
              💡 No custom products yet. Click the "Manage" button to add some, or use the "Add Custom Product" option.
            </span>
          )}
          {selectedName && selectedName !== "custom" && !errors.name && (
            <span style={{ color: "#28a745", fontSize: "12px" }}>
              ✅ Product selected: {selectedName} - Unit has been auto-set
            </span>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Unit *</span>
          <select 
            {...register("unit")}
            style={{
              padding: "10px 12px",
              border: selectedName && selectedName !== "custom" ? "2px solid #28a745" : "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: selectedName && selectedName !== "custom" ? "#f8fff9" : "white",
              fontWeight: selectedName && selectedName !== "custom" ? "500" : "normal"
            }}
          >
            <option value="kg">kg</option>
            <option value="pack">pack</option>
          </select>
          {errors.unit && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.unit.message as string}</span>}
          {selectedName && selectedName !== "custom" && !errors.unit && (
            <span style={{ color: "#28a745", fontSize: "12px" }}>
              🔄 Auto-populated from selected product
            </span>
          )}
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Sale Price *</span>
          <input
            type="number"
            step={0.01}
            min={0}
            placeholder="0.00"
            {...register("salePrice", { valueAsNumber: true })}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
          {errors.salePrice && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.salePrice.message}</span>}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Quantity *</span>
          <input 
            type="number" 
            min={0} 
            step={1} 
            placeholder="0"
            {...register("quantity", { valueAsNumber: true })} 
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
          {errors.quantity && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.quantity.message}</span>}
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: "500", color: "#333" }}>Sale Date *</span>
        <input 
          type="date" 
          {...register("buyingDate")} 
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            maxWidth: "200px"
          }}
        />
        {errors.buyingDate && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.buyingDate.message as string}</span>}
      </label>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button 
          type="submit"
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#218838"}
          onMouseOut={(e) => e.currentTarget.style.background = "#28a745"}
        >
          {product ? "🔄 Update Product" : "✅ Create Product"}
        </button>
        {product && (
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#5a6268"}
            onMouseOut={(e) => e.currentTarget.style.background = "#6c757d"}
          >
            ❌ Cancel
          </button>
        )}
      </div>
    </form>
  );
}



