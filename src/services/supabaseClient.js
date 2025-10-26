import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdprbdudjoqiptxavzmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcHJiZHVkam9xaXB0eGF2em10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzM5NDQsImV4cCI6MjA3Njc0OTk0NH0.9sogcsR0gTaTe6nRsrsDxn8juj_atjw0PSxNWG-TAUA';

const supabase = createClient(supabaseUrl.trim(), supabaseKey);

export default supabase;



