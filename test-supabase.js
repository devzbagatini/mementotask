const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jfvhtrxsogzldcufgism.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmdmh0cnhzb2d6bGRjdWZnaXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjkyMzEsImV4cCI6MjA4NjIwNTIzMX0.haMBU4cm1iTDXJt5KCc78wlRr49I6gML00XZUpIsmPI'
);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test auth
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  console.log('Auth:', authError ? 'Error: ' + authError.message : 'OK');
  
  // Test workspaces table
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .limit(1);
  
  console.log('Workspaces:', wsError ? 'Error: ' + wsError.message : `Found ${workspaces.length} workspaces`);
  
  // Test items table
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .limit(1);
  
  console.log('Items:', itemsError ? 'Error: ' + itemsError.message : `Found ${items.length} items`);
}

testConnection();
