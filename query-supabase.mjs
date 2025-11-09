import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ceudbtokygaaeawdelne.supabase.co';
const supabaseKey = '***REDACTED_ANON_KEY***';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryMaterials() {
  console.log('Querying materials_with_scores view...\n');
  
  const { data, error } = await supabase
    .from('materials_with_scores')
    .select('*')
    .order('total', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    console.error('Details:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No materials found in database.');
    return;
  }

  console.log(`Found ${data.length} materials:\n`);
  console.table(data.map(m => ({
    Name: m.name,
    Type: m.material_type,
    'Point of Origin': m.point_of_origin,
    Transport: m.transport,
    Construction: m.construction,
    Production: m.production,
    Disposal: m.disposal,
    Total: m.total
  })));
}

queryMaterials();
