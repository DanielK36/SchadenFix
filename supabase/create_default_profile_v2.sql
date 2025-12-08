-- ============================================
-- CREATE DEFAULT PROFILE (V2 - With Auth User)
-- ============================================
-- This creates a system user and profile for receiving orders
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  system_user_id UUID;
  system_email TEXT := 'system@schadenportal.local';
BEGIN
  -- Check if system user already exists
  SELECT id INTO system_user_id
  FROM auth.users
  WHERE email = system_email
  LIMIT 1;

  -- If user doesn't exist, create it
  IF system_user_id IS NULL THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      system_email,
      crypt('system-password-' || gen_random_uuid()::text, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Admin","is_system":true}',
      false,
      '',
      ''
    )
    RETURNING id INTO system_user_id;

    RAISE NOTICE 'Created system user with ID: %', system_user_id;
  ELSE
    RAISE NOTICE 'System user already exists with ID: %', system_user_id;
  END IF;

  -- Create profile for the system user
  INSERT INTO profiles (id, role, company_id, company_name, full_name)
  VALUES (
    system_user_id,
    'chef',
    system_user_id, -- Self-reference
    'Default Company',
    'System Admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'chef',
      company_id = COALESCE(profiles.company_id, system_user_id),
      company_name = COALESCE(profiles.company_name, 'Default Company');

  RAISE NOTICE 'Profile created/updated for system user';
END $$;


