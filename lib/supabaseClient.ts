import { createClient } from "@supabase/supabase-js";

// Public project URL + publishable (anon) key — safe to expose client-side,
// access is enforced by Postgres Row Level Security policies.
const SUPABASE_URL = "https://cddwjdjtctngdxlokahl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_119rWpT6ZVzehvx9Wl5gFQ_3Jf4Bv7x";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const USER_AUDIO_BUCKET = "user-audio";
export const MAX_USER_AUDIO_FILES = 5;
export const MAX_USER_AUDIO_BYTES = 5 * 1024 * 1024; // 5MB
export const USER_AUDIO_RETENTION_DAYS = 25;

export type UserAudioRow = {
  id: string;
  owner_id: string;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  uploaded_at: string;
  expires_at: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};
