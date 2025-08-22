# Database Setup Guide

This guide will help you set up a PostgreSQL database for your Charity Application using Supabase.

## Option 1: Supabase (Recommended)

### 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Project Credentials
1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in your project root with:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Set Up Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Run the SQL script to create tables and sample data

### 4. Test the Connection
1. Start your development server: `npm run dev`
2. Check the browser console for any database connection errors
3. Try creating a product or sale to verify the database is working

## Option 2: Local PostgreSQL

### 1. Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE charity_app;

# Connect to the database
\c charity_app

# Run the schema from database-schema.sql
```

### 3. Update Configuration
Update `src/utils/database.ts` to use your local PostgreSQL connection instead of Supabase.

## Database Schema Overview

### Products Table
- `id`: Unique identifier (UUID)
- `name`: Product name (any string, including custom products)
- `unit`: Unit of measurement (kg, pack)
- `sale_price`: Sale price per unit
- `quantity`: Available quantity
- `buying_date`: Date when product was purchased
- `created_at`, `updated_at`: Timestamps

### Custom Products Table
- `id`: Unique identifier (UUID)
- `name`: User-defined product name (unique)
- `unit`: Unit of measurement (kg, pack)
- `created_at`, `updated_at`: Timestamps

### Sales Table
- `id`: Unique identifier (UUID)
- `product_id`: Reference to products table
- `weight`: Weight sold in kg
- `price_per_kg`: Price per kg
- `expected_cash`: Expected payment amount
- `received_cash`: Actual payment received
- `sale_date`: Date of sale
- `topup`: Additional payment/adjustment
- `arrears`: Calculated field (expected - received - topup)
- `created_at`, `updated_at`: Timestamps

## Features

- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Data Validation**: Check constraints ensure data integrity
- **Foreign Key Relationships**: Sales are linked to products
- **Calculated Fields**: Arrears is automatically calculated
- **Indexes**: Optimized for common queries
- **Row Level Security**: Ready for production use

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your Supabase URL and API key
2. **Table Not Found**: Make sure you've run the schema SQL
3. **Permission Denied**: Check if RLS is enabled and policies are set
4. **CORS Error**: Ensure your Supabase project allows your domain

### Debug Mode
Set `VITE_DEBUG=true` in your `.env` file to see detailed database operations in the console.

## Next Steps

1. **Data Migration**: If you have existing localStorage data, create a migration script
2. **Authentication**: Add user authentication with Supabase Auth
3. **Real-time Updates**: Enable real-time subscriptions for live data updates
4. **Backup**: Set up automated database backups
5. **Monitoring**: Add database performance monitoring

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive configuration
- Enable Row Level Security (RLS) in production
- Regularly rotate your API keys
- Monitor database access logs
