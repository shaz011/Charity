import { useEffect, useMemo, useState } from "react";
import { Product, ProductInput } from "./types";

const STORAGE_KEY = "charity.products.v3";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readFromStorage(): Product[] {
  try {
    // migrate from v1 if needed
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as Product[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p) => ({
        ...p,
        quantity: (p as any).quantity ?? 0,
        buyingDate: (p as any).buyingDate ?? new Date().toISOString().slice(0, 10),
      }));
    }

    const legacy = localStorage.getItem("charity.products.v1");
    if (!legacy) return [];
    const parsed = JSON.parse(legacy) as any[];
    if (!Array.isArray(parsed)) return [];
    const migrated: Product[] = parsed.map((p: any) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      salePrice: p.salePrice ?? 0,
      quantity: p.quantity ?? 0,
      buyingDate: p.buyingDate ?? new Date().toISOString().slice(0, 10),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

function writeToStorage(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useLocalProducts() {
  const [products, setProducts] = useState<Product[]>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(products);
  }, [products]);

  const createProduct = (input: ProductInput): void => {
    const now = new Date().toISOString();
    const product: Product = { id: generateId(), createdAt: now, updatedAt: now, ...input };
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (id: string, input: ProductInput): void => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = (id: string): void => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  return { products: sorted, createProduct, updateProduct, deleteProduct };
}


