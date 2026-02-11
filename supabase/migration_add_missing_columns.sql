-- ============================================
-- MIGRATION: Add missing columns to existing tables
-- ============================================
-- Run this AFTER the partners table has been created
-- This adds columns that may be missing from existing tables

-- Add partner_id and parent_partner_id to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added partner_id column to profiles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_partner_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN parent_partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added parent_partner_id column to profiles';
  END IF;
END $$;

-- Add assigned_partner_id to orders if it doesn't exist AND partners table exists
DO $$
BEGIN
  -- Check if partners table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'partners'
  ) THEN
    -- Partners table exists, safe to add column with FK constraint
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
    ) THEN
      ALTER TABLE orders ADD COLUMN assigned_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added assigned_partner_id column to orders';
    END IF;
  ELSE
    RAISE NOTICE 'partners table does not exist yet - skipping assigned_partner_id column. Run this migration again after creating partners table.';
  END IF;
END $$;

-- Create index for assigned_partner_id if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_partner_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_orders_assigned_partner_id ON orders(assigned_partner_id);
    RAISE NOTICE 'Created index for assigned_partner_id';
  END IF;
END $$;

