import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemConsumedInput, GeneralExpense, CustomItem } from "../utils/types";

interface ItemConsumedFormProps {
  consumedItem?: { id: string } & ItemConsumedInput;
  generalExpenses: GeneralExpense[];
  customItems: CustomItem[];
  onSubmit: (data: ItemConsumedInput) => void;
  onCancel: () => void;
}

const schema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  unit: z.enum(["kg", "pack", "piece", "liter", "dozen", "gram", "bottle", "packet"]),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  weight: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  consumptionDate: z.string().min(1, "Consumption date is required"),
  notes: z.string().optional(),
  sourceType: z.enum(["general_expense", "custom_item"]),
  sourceId: z.string().optional(),
});

export function ItemConsumedForm({ 
  consumedItem, 
  generalExpenses, 
  customItems, 
  onSubmit, 
  onCancel 
}: ItemConsumedFormProps): JSX.Element {
  const [isCustomItem, setIsCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<"general_expense" | "custom_item">("general_expense");
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ItemConsumedInput>({
    resolver: zodResolver(schema),
    defaultValues: { 
      itemName: "", 
      unit: "kg", 
      quantity: 0, 
      weight: 0,
      price: 0,
      consumptionDate: new Date().toISOString().slice(0, 10),
      notes: "",
      sourceType: "general_expense",
      sourceId: ""
    },
  });

  const selectedItemName = watch("itemName");
  const watchedSourceType = watch("sourceType");

  useEffect(() => {
    if (consumedItem) {
      setValue("itemName", consumedItem.itemName);
      setValue("unit", consumedItem.unit);
      setValue("quantity", consumedItem.quantity);
      setValue("weight", consumedItem.weight ?? 0);
      setValue("price", consumedItem.price ?? 0);
      setValue("consumptionDate", consumedItem.consumptionDate);
      setValue("notes", consumedItem.notes ?? "");
      setValue("sourceType", consumedItem.sourceType);
      setValue("sourceId", consumedItem.sourceId ?? "");
      
      // Check if it's a custom item
      const isCustom = !generalExpenses.some(exp => exp.name === consumedItem.itemName) && 
                      !customItems.some(item => item.name === consumedItem.itemName);
      setIsCustomItem(isCustom);
      if (isCustom) {
        setCustomItemName(consumedItem.itemName);
      }
    } else {
      setValue("itemName", "");
      setValue("unit", "kg");
      setValue("quantity", 0);
      setValue("weight", 0);
      setValue("price", 0);
      setValue("consumptionDate", new Date().toISOString().slice(0, 10));
      setValue("notes", "");
      setValue("sourceType", "general_expense");
      setValue("sourceId", "");
      setIsCustomItem(false);
      setCustomItemName("");
    }
  }, [consumedItem, setValue, generalExpenses, customItems]);

  const handleSourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "general_expense" | "custom_item";
    setSelectedSourceType(value);
    setValue("sourceType", value);
    setValue("itemName", "");
    setValue("sourceId", "");
    setIsCustomItem(false);
    setCustomItemName("");
  };

  const handleItemSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustomItem(true);
      setValue("itemName", customItemName);
    } else {
      setIsCustomItem(false);
      setValue("itemName", value);
      setCustomItemName("");
      
      // Auto-set unit, price, and find source ID
      if (selectedSourceType === "general_expense") {
        const selectedExpense = generalExpenses.find(exp => exp.name === value);
        if (selectedExpense) {
          setValue("unit", selectedExpense.unit);
          setValue("price", selectedExpense.price);
          setValue("sourceId", selectedExpense.id);
        }
      } else {
        const selectedCustomItem = customItems.find(item => item.name === value);
        if (selectedCustomItem) {
          setValue("unit", selectedCustomItem.unit);
          setValue("price", 0); // Custom items don't have price
          setValue("sourceId", selectedCustomItem.id);
        }
      }
    }
  };

  const handleCustomItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomItemName(value);
    setValue("itemName", value);
  };

  const handleFormSubmit = async (data: ItemConsumedInput) => {
    try {
      console.log('=== ITEM CONSUMED FORM HANDLER START ===');
      console.log('Form data received:', data);
      console.log('Form validation passed');
      console.log('Calling onSubmit with data:', data);
      
      await onSubmit(data);
      
      console.log('onSubmit completed successfully');
      
      // Reset form after successful submission (only for new items)
      if (!consumedItem) {
        console.log('Resetting form for new consumed item');
        reset({
          itemName: "",
          unit: "kg",
          quantity: 0,
          weight: 0,
          price: 0,
          consumptionDate: new Date().toISOString().slice(0, 10),
          notes: "",
          sourceType: "general_expense",
          sourceId: ""
        });
        setIsCustomItem(false);
        setCustomItemName("");
        console.log('Form reset completed');
      }
      
      console.log('=== ITEM CONSUMED FORM HANDLER END ===');
    } catch (error) {
      console.error('=== ITEM CONSUMED FORM HANDLER ERROR ===');
      console.error('Form submission error:', error);
    }
  };

  // Get available items based on source type
  const availableItems = selectedSourceType === "general_expense" ? generalExpenses : customItems;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Source Type *</span>
          <select
            value={selectedSourceType}
            onChange={handleSourceTypeChange}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
          >
            <option value="general_expense">General Expenses</option>
            <option value="custom_item">Custom Items</option>
          </select>
          {errors.sourceType && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.sourceType.message}</span>}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Consumption Date *</span>
          <input 
            type="date" 
            {...register("consumptionDate")} 
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
          {errors.consumptionDate && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.consumptionDate.message}</span>}
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: "500", color: "#333" }}>Item Name *</span>
        <div style={{ display: "flex", gap: "8" }}>
          {isCustomItem ? (
            <div style={{ display: "flex", gap: "8", flex: 1 }}>
              <input
                type="text"
                placeholder="Enter custom item name"
                value={customItemName}
                onChange={handleCustomItemChange}
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
                  setIsCustomItem(false);
                  setCustomItemName("");
                  setValue("itemName", "");
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
              value={selectedItemName}
              onChange={handleItemSelection}
              style={{
                flex: 1,
                padding: "10px 12px",
                border: selectedItemName && selectedItemName !== "custom" ? "2px solid #28a745" : "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: selectedItemName && selectedItemName !== "custom" ? "#f8fff9" : "white",
                fontWeight: selectedItemName && selectedItemName !== "custom" ? "500" : "normal"
              }}
            >
              <option value="">Select an item</option>
              {availableItems.length === 0 ? (
                <option value="custom" disabled>
                  No {selectedSourceType === "general_expense" ? "expenses" : "custom items"} yet
                </option>
              ) : (
                <>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                  <option value="custom">➕ Add Custom Item</option>
                </>
              )}
            </select>
          )}
        </div>
        {errors.itemName && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.itemName.message}</span>}
        {availableItems.length === 0 && !errors.itemName && (
          <span style={{ color: "#6c757d", fontSize: "12px" }}>
            💡 No {selectedSourceType === "general_expense" ? "expenses" : "custom items"} yet. Add some first.
          </span>
        )}
        {selectedItemName && selectedItemName !== "custom" && !errors.itemName && (
          <span style={{ color: "#28a745", fontSize: "12px" }}>
            ✅ Item selected: {selectedItemName} - Unit has been auto-set
          </span>
        )}
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Unit *</span>
          <select 
            {...register("unit")}
            style={{
              padding: "10px 12px",
              border: selectedItemName && selectedItemName !== "custom" ? "2px solid #28a745" : "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: selectedItemName && selectedItemName !== "custom" ? "#f8fff9" : "white",
              fontWeight: selectedItemName && selectedItemName !== "custom" ? "500" : "normal"
            }}
          >
            <option value="kg">kg</option>
            <option value="pack">pack</option>
            <option value="piece">piece</option>
            <option value="liter">liter</option>
            <option value="dozen">dozen</option>
            <option value="gram">gram</option>
            <option value="bottle">bottle</option>
            <option value="packet">packet</option>
          </select>
          {errors.unit && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.unit.message as string}</span>}
          {selectedItemName && selectedItemName !== "custom" && !errors.unit && (
            <span style={{ color: "#28a745", fontSize: "12px" }}>
              🔄 Auto-populated from selected item
            </span>
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Quantity Consumed *</span>
          <input
            type="number"
            step={0.01}
            min={0.01}
            placeholder="0.00"
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Weight (kg) - Optional</span>
          <input
            type="number"
            step={0.01}
            min={0}
            placeholder="0.00 kg (if applicable)"
            {...register("weight", { valueAsNumber: true })}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
          {errors.weight && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.weight.message}</span>}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: "500", color: "#333" }}>Price per Unit - Auto-populated</span>
          <input
            type="number"
            step={0.01}
            min={0}
            placeholder="0.00"
            {...register("price", { valueAsNumber: true })}
            style={{
              padding: "10px 12px",
              border: selectedItemName && selectedItemName !== "custom" ? "2px solid #28a745" : "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: selectedItemName && selectedItemName !== "custom" ? "#f8fff9" : "white",
              fontWeight: selectedItemName && selectedItemName !== "custom" ? "500" : "normal"
            }}
            readOnly={selectedItemName && selectedItemName !== "custom"}
          />
          {errors.price && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.price.message}</span>}
          {selectedItemName && selectedItemName !== "custom" && !errors.price && (
            <span style={{ color: "#28a745", fontSize: "12px" }}>
              💰 Auto-populated from selected item
            </span>
          )}
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: "500", color: "#333" }}>Notes - Optional</span>
        <textarea
          placeholder="Any additional notes about the consumption..."
          {...register("notes")}
          rows={3}
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
        {errors.notes && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.notes.message}</span>}
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
          {consumedItem ? "🔄 Update Consumption" : "✅ Record Consumption"}
        </button>
        {consumedItem && (
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
