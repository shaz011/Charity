import { useLocalStorage } from './useLocalStorage';
import { useDatabase } from './useDatabase';
import { useMemo } from 'react';

export function useDataStore() {
  const localStorageData = useLocalStorage();
  const databaseData = useDatabase();

  // Determine which data source to use based on database configuration
  const isDatabaseConfigured = useMemo(() => {
    try {
      return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    } catch {
      return false;
    }
  }, []);

  console.log('useDataStore: localStorageData loaded:', localStorageData.products.length, 'products');
  console.log('useDataStore: database configured:', isDatabaseConfigured);

  if (isDatabaseConfigured) {
    console.log('useDataStore: Using database for data storage');
    return databaseData;
  } else {
    console.log('useDataStore: Using localStorage for data storage');
    return localStorageData;
  }
}
