import React from 'react';

export function DatabaseStatus(): JSX.Element {
  const isDatabaseConfigured = (): boolean => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return !!(supabaseUrl && 
      supabaseKey && 
      supabaseUrl !== 'https://your-project-id.supabase.co' && 
      supabaseKey !== 'your-anon-key-here');
  };

  const isConfigured = isDatabaseConfigured();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: isConfigured ? '#e8f5e8' : '#fff3e0',
      color: isConfigured ? '#2e7d32' : '#f57c00',
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      border: `1px solid ${isConfigured ? '#4caf50' : '#ff9800'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}>
      {isConfigured ? '🗄️ Database' : '💾 Local Storage'}
    </div>
  );
}
