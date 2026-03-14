import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const urlsToTest = [
    // Different years - school level
    `https://educationdata.urban.org/api/v1/schools/edfacts/assessments/2015/99/?fips=37&per_page=1`,
    `https://educationdata.urban.org/api/v1/schools/edfacts/assessments/2013/99/?fips=37&per_page=1`,
    // District level as fallback
    `https://educationdata.urban.org/api/v1/school-districts/edfacts/assessments/2018/99/?fips=37&per_page=1`,
    `https://educationdata.urban.org/api/v1/school-districts/edfacts/assessments/2015/99/?fips=37&per_page=1`,
    // No grade segment at all
    `https://educationdata.urban.org/api/v1/schools/edfacts/assessments/2018/?fips=37&per_page=1`,
  ];

  for (const url of urlsToTest) {
    console.log(`\nTesting: ${url}`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ WORKS! Count:', data.count);
      console.log('Fields:', Object.keys(data.results?.[0] || {}));
      console.log('Sample:', JSON.stringify(data.results?.[0], null, 2));
    } else {
      const text = await res.text();
      console.log('❌', text.slice(0, 80));
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('💥 Unhandled error:', err);
  process.exit(1);
});
