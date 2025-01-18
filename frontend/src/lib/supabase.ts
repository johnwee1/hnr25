import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://suaqbnpbgidzmyshrboy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YXFibnBiZ2lkem15c2hyYm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNzE2MjQsImV4cCI6MjA1Mjc0NzYyNH0.UUPdN-dB50hcOAi0QDmFXTsMXW8bg-nUaRgduyXWjWk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
