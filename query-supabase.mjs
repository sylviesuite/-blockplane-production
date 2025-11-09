import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ceudbtokygaaeawdelne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldWRidG9reWdhYWVhd2RlbG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NjQ3MzksImV4cCI6MjA2MDM0MDczOX0.OIMe8CpqLiAzXJbb7XnOae4-fqVB3sNFFhRfVAfu30k';

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
