-- Migration: Add case assignment and abuse reporting fields
-- Run: psql -U postgres -d cwms -f database/migrate_cases.sql

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20) DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS reported_by VARCHAR(100) DEFAULT 'System';
