import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://fwqldotmbkdphsdcvcod.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cWxkb3RtYmtkcGhzZGN2Y29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTg1NTcsImV4cCI6MjA2NDM3NDU1N30.RcbkP_ZespHSGkUD0iOqhu-Scwswmc6gGwki1V-7aTg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initializeStorage() {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('memes')
      .list();

    if (listError) {
      console.warn('Note: Please configure the bucket "memes" in your Supabase dashboard:');
      console.warn('1. Go to Storage in your Supabase dashboard');
      console.warn('2. Create a new bucket named "memes"');
      console.warn('3. Set the bucket as public');
      console.warn('4. Add the following policies in the Authentication > Policies section:');
      console.warn('   - Enable select for public access');
      console.warn('   - Enable insert for authenticated users');
      console.warn('Error details:', listError.message);
    } else {
      console.log('Successfully connected to memes bucket');
      console.log('Files in bucket:', files?.length || 0);
    }

  } catch (error) {
    console.error('Error accessing storage:', error);
  }
} 