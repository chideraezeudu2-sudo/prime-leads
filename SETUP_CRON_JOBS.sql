-- Run this in Supabase Dashboard > SQL Editor
-- https://mvycneclkjlufzqfbggv.supabase.co/project/default/sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA pg_net TO postgres;
GRANT ALL ON SCHEMA pg_net TO supabase_service_role;

-- Drop existing cron jobs if any (to avoid duplicates)
SELECT cron.unschedule('weekly-scraper');
SELECT cron.unschedule('weekly-delivery');
SELECT cron.unschedule('loyalty-check');

-- Weekly scraper run (Sunday 11pm UTC = 6pm EST)
SELECT cron.schedule(
  'weekly-scraper',
  '0 23 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://mvycneclkjlufzqfbggv.supabase.co/functions/v1/run-apify-scraper',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eWNuZWNsa2psdWZ6cWZiZ2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwMzE3MSwiZXhwIjoyMDk2MDc5MTcxfQ.NJ-zA_Ko6E5rqKrQbOmHxxzu0rxxoZK5QsauBi6BsRw"}'::jsonb,
    body := '{"lead_type": "pre-foreclosure", "limit": 100}'::jsonb
  );
  $$
);

-- Weekly delivery run (Monday 6am UTC = 1am EST)
SELECT cron.schedule(
  'weekly-delivery',
  '0 6 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://mvycneclkjlufzqfbggv.supabase.co/functions/v1/deliver-leads',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eWNuZWNsa2psdWZ6cWZiZ2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwMzE3MSwiZXhwIjoyMDk2MDc5MTcxfQ.NJ-zA_Ko6E5rqKrQbOmHxxzu0rxxoZK5QsauBi6BsRw"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Loyalty month increment check (1st of every month, 8am UTC)
SELECT cron.schedule(
  'loyalty-check',
  '0 8 1 * *',
  $$
  UPDATE subscribers
  SET loyalty_months = loyalty_months + 1
  WHERE status = 'active'
  AND loyalty_paused = false;
  $$
);

-- Verify cron jobs are created
SELECT * FROM cron.job;