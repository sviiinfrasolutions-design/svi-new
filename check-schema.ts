import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function check() {
  const { data: aData, error: aError } = await supabase.from('allotments').select('*').limit(1);
  console.log('allotments:', aData, aError);
  const { data: upData, error: upError } = await supabase
    .from('user_properties')
    .select('*')
    .limit(1);
  console.log('user_properties:', upData, upError);
}
check();
