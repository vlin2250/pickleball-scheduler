-- Migration: Add host column to sessions table
-- Run this in Supabase SQL Editor if you have existing sessions

-- Add host column with default value 'bill' (so existing sessions become Bill's)
ALTER TABLE sessions ADD COLUMN host TEXT NOT NULL DEFAULT 'bill';

-- If you want to remove the default after adding the column (optional)
-- ALTER TABLE sessions ALTER COLUMN host DROP DEFAULT;
